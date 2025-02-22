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
    socket.on("JOIN_ROOM", handleJoinRoom(socket, roomManager));
    // socket.on("disconnect", handleDisconnect(socket, roomManager));
    socket.on("createRoom", () => {
      const roomCode = roomManager.createRoomWithRandomName();
      socket.emit("roomCode", roomCode);
      console.log("room created with code: ", roomCode);
      socket.join(roomCode);
    });
    socket.on("getUsers", () => {

      const users = roomManager.getUsersInRoom(roomManager.getUserRoom(socket.id));
      socket.emit("updateUsers", users);
    });

    socket.on("end_game", () => {

      // TO DO Replace the socket ids with the user ids
      console.log("end the game");

    });

    socket.on("joinRoomAuthenticated", async ({ userId, roomCode, token }) => {
      console.log("joinRoomAuthenticated", userId, roomCode, token);
      if (!token) {
        console.error("Token must be provided");
        socket.emit("RoomErr", "Token must be provided");
        return;
      }
    
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("decoded", decoded);
    
        if (roomManager.getRoom(roomCode)) {

          const email = decoded.email;
          const result = await sql`SELECT id, name FROM users WHERE email = ${email}`;

          const usersUserID = result.rows[0].id;
          const usersUserName = result.rows[0].name;

          roomManager.addUserToRoomAuth(userId, roomCode, usersUserName, usersUserID);
          socket.join(roomCode);
    
          console.log(userId, "joined room", roomCode);
          const users = roomManager.getUsersInRoom(roomCode);
          socket.to(roomCode).emit("updateUsers", users);
    
          socket.emit("roomJoinSuccess", "Successfully joined room " + roomCode);
        } else {
          socket.emit("RoomErr", "Room number " + roomCode + " does not exist");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        socket.emit("RoomErr", "Invalid token");
      }
    });

    socket.on("gameStarted", (roomCode) => {
      // the game has started
      // send a message to everyone in  that room saying that thge game has started
      socket.to(roomCode).emit("gameStarted", "the game has started!");

    });

    socket.on("input_from_client_to_game", (data) => {
      // console.log("input_from_client_to_game", data);
      // send data to the game
      socket.to(roomManager.getUserRoom(socket.id)).emit("game_input", data);
    });

    socket.on("output_from_game_to_client", (data) => {
      // console.log("output_from_game_to_client", data);
      // send data to the client
      socket.to(roomManager.getUserRoom(data.PlayerID)).emit("output_from_game_to_client", data);
      // socket.emit("output_from_game_to_client", data);
    });
      
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