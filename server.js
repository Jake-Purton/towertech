import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { RoomManager } from "./src/rooms.js";
import jwt from "jsonwebtoken";
import { handleMessage, handleJoinRoom, handleDisconnect } from "./src/eventHandlers.js";
import dotenv from "dotenv";
import { sql } from "@vercel/postgres";

dotenv.config();

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT secret is not set (check readme for adding secrets)");
  process.exit(1); // Exit the process if JWT_SECRET is not set
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const roomManager = new RoomManager();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("MESSAGE", handleMessage(socket));
    socket.on("JOIN_ROOM", handleJoinRoom(socket, roomManager, JWT_SECRET));
    // socket.on("disconnect", handleDisconnect(socket, roomManager));
    socket.on("createRoom", () => {
      const roomCode = roomManager.createRoomWithRandomName();
      const tokenOptions = { expiresIn: '1d' };
      jwt.sign({ roomCode }, JWT_SECRET, tokenOptions, (err, roomToken) => {
        if (err) {
          console.error("Error creating token:", err);
          return;
        }
        socket.emit("roomCode", {roomCode, roomToken});
      });

      console.log("room created with code: ", roomCode);
      socket.join(roomCode);
    });

    socket.on("getUsers", (indexToken) => {
      if (indexToken) {
        try {
          const decoded = jwt.verify(indexToken, JWT_SECRET);
          const swap = roomManager.swapSocketID(decoded.uIndex, decoded.roomId, socket.id);
          // if the swap actually needed to happen
          if (swap) {
            // tell the game to swap the playerid
            socket.to(decoded.roomId).emit("swapSocketID", {oldID: swap.oldID, newID: swap.newID})
            socket.join(decoded.roomId)
          }
        } catch {
          console.log("error with decoding index token")
        }
      }

      const users = roomManager.getUsersInRoom(roomManager.getUserRoom(socket.id));
      socket.emit("updateUsers", users);
    });

    socket.on("getUsersHost", (code) => {

      const users = roomManager.getUsersInRoom(code);
      socket.emit("updateUsers", users);
    });

    socket.on("end_game", (data) => {

      const roomToken = data.token;
      const gameID = data.id;

      jwt.verify(roomToken, JWT_SECRET, async (err, decoded) => {
        if (err) {
          console.error("Invalid token server.js:", err);
          return;
        }
        const roomCode = decoded.roomCode;
        socket.to(roomCode).emit('end_game_client', {room: roomCode, id: gameID})

        const users = roomManager.getUsersInRoom(roomCode);
        roomManager.deleteRoom(roomCode);

        for (const user of users) {

          if (user.usersUserID) {

            const result = await sql `
              UPDATE playeringame
              SET userid = ${user.usersUserID}
              WHERE userid = '0' AND playerid = ${user.userID};
            `;

          }
        }
      });

      console.log("end the game", gameID);

    });

    socket.on("joinRoomAuthenticated", async ({ userId, roomCode, token }) => {
      if (!token) {
        console.error("Token must be provided");
        socket.emit("RoomErr", "Token must be provided");
        return;
      }
    
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
    
        if (roomManager.getRoom(roomCode)) {

          const email = decoded.email;
          const result = await sql`SELECT id, name FROM users WHERE email = ${email}`;

          const usersUserID = result.rows[0].id;
          const usersUserName = result.rows[0].name;

          const uIndex = roomManager.addUserToRoomAuth(userId, roomCode, usersUserName, usersUserID);
          socket.join(roomCode);
    
          const users = roomManager.getUsersInRoom(roomCode);
          socket.to(roomCode).emit("updateUsers", users);
    
          const tokenOptions = { expiresIn: '1d' };
          jwt.sign({ uIndex, roomId: roomCode }, JWT_SECRET, tokenOptions, (err, indexToken) => {
            if (err) {
              console.error("Error creating token:", err);
              return;
            }
            socket.emit("roomJoinSuccess", ({username: usersUserName, token: indexToken}));
          });

        } else {
          socket.emit("RoomErr", "Room number " + roomCode + " does not exist");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        socket.emit("RoomErr", "Invalid token");
      }

    });

    socket.on("removeUser", async (data) => {
      roomManager.removeUserFromRoom(data.userid, data.roomName)

      const users = roomManager.getUsersInRoom(data.roomName);
      socket.to(data.roomName).emit("updateUsers", users);
      
      try {
        const user_sockets = await io.sockets.in(data.userid).fetchSockets();
        const user_socket = user_sockets.find(socket => socket.id.toString() === data.userid);

        user_socket.leave(data.roomName);

        user_socket.emit("You have been ejected")

      } catch (e) {
        console.log(e)
      }

      socket

    });

    socket.on("gameStarted", (roomCode) => {
      // the game has started
      // send a message to everyone in that room saying that the game has started
      socket.to(roomCode).emit("gameStarted", "the game has started!");
    });

    socket.on("input_from_client_to_game", (data) => {
      socket.to(roomManager.getUserRoom(socket.id)).emit("game_input", data);
    });

    socket.on("output_from_game_to_client", (data) => {
      // send data to the client
      socket.to(roomManager.getUserRoom(data.PlayerID)).emit("output_from_game_to_client", data);
      // socket.emit("output_from_game_to_client", data);
    });
    socket.emit("connection_finished")
      
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});