import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { RoomManager } from "./src/rooms.js";
import { handleMessage, handleJoinRoom, handleJakeyMessage } from "./src/eventHandlers.js";

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
    socket.on("JAKEY_MESSAGE", handleJakeyMessage(socket));
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
    socket.on("createRoom", () => {
      const roomCode = roomManager.createRoomWithRandomName();
      socket.emit("roomCode", roomCode);
      socket.join(roomCode);
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