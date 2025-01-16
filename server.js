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

// messages:
// create_room (client_id) -> create a new room with new room id add client id

// join_room (client_id, room_id)-> join a room with room id if exists add client to that room if not exists return error_room_not_found
// if client is already in a room, leave that room and join the new room

// leave_room (client_id, room_id) -> leave a room with room id, remove client from that room

// error_room_not_found -> error message for room not found, (room_id)
// error_room_exists -> error message for room already exists, (room_id)