import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

const TOKEN_OPTIONS = { expiresIn: "1d" };
const MAX_USERNAME_LENGTH = 20;
// how long a room survives after its host disconnects without coming back
const ROOM_ABANDON_MS = 15 * 60 * 1000;

function isRoomCode(value) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

function registerSocketHandlers(io, socket, roomManager, secret) {

  // Registers an event handler that can't take the server down: a thrown error or rejected
  // promise in any handler is logged instead of becoming an uncaught exception, which would
  // exit the process and disconnect every player in every room
  function on(event, handler) {
    socket.on(event, async (...args) => {
      try {
        await handler(...args);
      } catch (err) {
        console.error(`Error handling "${event}" from ${socket.id}:`, err);
      }
    });
  }

  function emitUsers(roomCode) {
    io.to(roomCode).emit("updateUsers", roomManager.getUsersInRoom(roomCode));
  }

  // Deletes a room and tells everyone still in it that it is gone
  function closeRoom(roomCode) {
    io.to(roomCode).emit("updateUsers", []);
    io.in(roomCode).socketsLeave(roomCode);
    roomManager.deleteRoom(roomCode);
    console.log("room closed: ", roomCode);
  }

  function joinRoom(roomCode, username, usersUserID) {
    const currentRoom = roomManager.getUserRoom(socket.id);
    if (currentRoom) {
      roomManager.removeUserFromRoom(socket.id, currentRoom);
      socket.leave(currentRoom);
      emitUsers(currentRoom);
    }

    const seatID = roomManager.addUserToRoom(socket.id, roomCode, username, usersUserID);
    socket.join(roomCode);
    socket.to(roomCode).emit("updateUsers", roomManager.getUsersInRoom(roomCode));

    const indexToken = jwt.sign({ seatID, roomId: roomCode }, secret, TOKEN_OPTIONS);
    socket.emit("roomJoinSuccess", { username, token: indexToken });
  }

  // a socket that comes back within the recovery window keeps its id and rooms,
  // so a returning host just needs its room's pending deletion cancelled
  if (socket.recovered) {
    const hostedRoom = roomManager.getRoomHostedBy(socket.id);
    if (hostedRoom) {
      roomManager.cancelCleanup(hostedRoom);
    }
  }

  on("MESSAGE", () => {
    socket.emit("message", `Hello from server`);
  });

  on("createRoom", () => {
    // a host only runs one room, drop any room this socket made earlier (e.g. a remounted host page)
    const previousRoom = roomManager.getRoomHostedBy(socket.id);
    if (previousRoom) {
      closeRoom(previousRoom);
    }

    const roomCode = roomManager.createRoomWithRandomName(socket.id);
    socket.join(roomCode);
    const roomToken = jwt.sign({ roomCode }, secret, TOKEN_OPTIONS);
    socket.emit("roomCode", { roomCode, roomToken });
    console.log("room created with code: ", roomCode);
  });

  // the host reconnected with a new socket id, take the room back over
  on("rejoinHost", (roomToken) => {
    const { roomCode } = jwt.verify(roomToken, secret);
    if (!roomManager.getRoom(roomCode)) {
      socket.emit("RoomErr", "Room number " + roomCode + " does not exist");
      return;
    }
    roomManager.setHost(roomCode, socket.id);
    socket.join(roomCode);

    // replay socket id swaps the game may have missed while the host was away
    for (const swap of roomManager.getSocketIDHistory(roomCode)) {
      socket.emit("swapSocketID", swap);
    }
    socket.emit("updateUsers", roomManager.getUsersInRoom(roomCode));
    console.log("host rejoined room: ", roomCode);
  });

  on("JOIN_ROOM", ({ roomId, username } = {}) => {
    username = typeof username === "string" ? username.trim() : "";
    if (!username || username.length >= MAX_USERNAME_LENGTH) {
      socket.emit("RoomErr", "Invalid username");
      return;
    }
    if (!isRoomCode(roomId) || !roomManager.getRoom(roomId)) {
      socket.emit("RoomErr", "Room number " + roomId + " does not exist");
      return;
    }
    joinRoom(roomId, username, null);
  });

  on("joinRoomAuthenticated", async ({ roomCode, token } = {}) => {
    if (!token) {
      socket.emit("RoomErr", "Token must be provided");
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      console.error("Invalid token:", error);
      socket.emit("RoomErr", "Invalid token");
      return;
    }

    if (!isRoomCode(roomCode) || !roomManager.getRoom(roomCode)) {
      socket.emit("RoomErr", "Room number " + roomCode + " does not exist");
      return;
    }

    const result = await sql`SELECT id, name FROM users WHERE email = ${decoded.email}`;
    if (result.rows.length === 0) {
      socket.emit("RoomErr", "User not found");
      return;
    }
    const { id: usersUserID, name: usersUserName } = result.rows[0];

    // the room may have closed while we were waiting on the database
    if (!roomManager.getRoom(roomCode)) {
      socket.emit("RoomErr", "Room number " + roomCode + " does not exist");
      return;
    }
    joinRoom(roomCode, usersUserName, usersUserID);
  });

  // a player asks who is in their room, optionally reclaiming their seat after reconnecting
  on("getUsers", (indexToken) => {
    if (indexToken) {
      try {
        const { seatID, roomId } = jwt.verify(indexToken, secret);
        const swap = roomManager.swapSocketID(seatID, roomId, socket.id);
        // if the swap actually needed to happen
        if (swap) {
          socket.join(roomId);
          // tell the game to swap the playerid
          io.to(roomManager.getRoom(roomId).hostSocketId).emit("swapSocketID", swap);
        }
      } catch {
        console.log("error with decoding index token");
      }
    }

    socket.emit("updateUsers", roomManager.getUsersInRoom(roomManager.getUserRoom(socket.id)));
  });

  on("getUsersHost", (roomCode) => {
    if (!roomManager.isHost(socket.id, roomCode)) {
      return;
    }
    socket.emit("updateUsers", roomManager.getUsersInRoom(roomCode));
  });

  on("removeUser", ({ userid, roomName } = {}) => {
    if (!roomManager.isHost(socket.id, roomName) || typeof userid !== "string") {
      return;
    }
    roomManager.removeUserFromRoom(userid, roomName);
    emitUsers(roomName);

    io.in(userid).socketsLeave(roomName);
    io.to(userid).emit("You have been ejected");
  });

  on("gameStarted", (roomCode) => {
    if (!roomManager.isHost(socket.id, roomCode)) {
      return;
    }
    // send a message to everyone in that room saying that the game has started
    socket.to(roomCode).emit("gameStarted", "the game has started!");
  });

  on("end_game", async ({ token, id: gameID } = {}) => {
    let roomCode;
    try {
      ({ roomCode } = jwt.verify(token, secret));
    } catch (err) {
      console.error("Invalid token in end_game:", err);
      return;
    }
    console.log("end the game", gameID);

    socket.to(roomCode).emit("end_game_client", { room: roomCode, id: gameID });

    const users = roomManager.getUsersInRoom(roomCode);
    io.in(roomCode).socketsLeave(roomCode);
    roomManager.deleteRoom(roomCode);

    for (const user of users) {
      if (user.usersUserID) {
        await sql`
          UPDATE playeringame
          SET userid = ${user.usersUserID}
          WHERE userid = '0' AND playerid = ${user.userID};
        `;
      }
    }
  });

  // player controller -> game, sent only to the host rather than the whole room
  on("input_from_client_to_game", (data) => {
    const room = roomManager.getRoom(roomManager.getUserRoom(socket.id));
    if (!room || typeof data !== "object" || data === null) {
      return;
    }
    // the sender is whoever owns this socket, whatever the payload claims
    data.PlayerID = socket.id;
    io.to(room.hostSocketId).emit("game_input", data);
  });

  // game -> one player's controller, only the room's host may send these
  on("output_from_game_to_client", (data) => {
    if (typeof data?.PlayerID !== "string") {
      return;
    }
    const roomCode = roomManager.getUserRoom(data.PlayerID);
    if (!roomManager.isHost(socket.id, roomCode)) {
      return;
    }
    io.to(data.PlayerID).emit("output_from_game_to_client", data);
  });

  // Players are kept in their room when they drop so they can reclaim their seat with their
  // index token. A room whose host doesn't come back is eventually deleted.
  socket.on("disconnect", (reason) => {
    const hostedRoom = roomManager.getRoomHostedBy(socket.id);
    if (hostedRoom) {
      console.log(`host of room ${hostedRoom} disconnected (${reason})`);
      roomManager.scheduleCleanup(hostedRoom, ROOM_ABANDON_MS, () => closeRoom(hostedRoom));
    }
  });
}

export { registerSocketHandlers };
