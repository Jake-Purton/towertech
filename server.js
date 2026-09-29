import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { RoomManager } from "./src/rooms.js";
import { registerSocketHandlers } from "./src/eventHandlers.js";
import dotenv from "dotenv";

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

// never let a stray rejected promise take down every connected game
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    // A phone that locks its screen or loses wifi briefly comes back with the same socket id,
    // the same rooms and any events it missed, so neither the game nor the lobby notices the drop.
    // Longer outages fall back to the index/room tokens (see getUsers and rejoinHost).
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket, roomManager, JWT_SECRET);
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });

  // disconnect sockets cleanly when docker stops the container instead of waiting to be killed
  process.once("SIGTERM", () => {
    io.close(() => process.exit(0));
  });
});