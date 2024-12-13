import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

var rooms_dict = {};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    // Listen for messages
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      // Respond to the message
      socket.emit("message", `Hello from server`);
    });
    // listen for server join message
    socket.on("join", ({ userId, room }) => {
      console.log("Joining room:", room);

      if (room in rooms_dict) {
        rooms_dict[room].push(socket.id);
        socket.join(room);
        io.to(room).emit("message", `User joined room: ${room}`);
      } else {
        io.to(userId).emit("message", "Room does not exist");
      }
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