import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { RoomManager } from "./src/rooms.js";
import { handleMessage, handleJoinRoom, handleDisconnect } from "./src/eventHandlers.js";
import { sql } from "@vercel/postgres";

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

    socket.on("end_game_output", async (data) => {
      console.log("end_game_output", data);

      // {gamescore, playerdata}
      // playerdata = list of dicts with playerID and score and player kills

      // we wanna put this into the database
      
      const result = await sql`INSERT INTO gameleaderboard (score) VALUES (${data.gamescore}) RETURNING gameid`;
      const gameid = result.rows[0].gameid;
      console.log(gameid);

      console.log(data.player_data);

      for (const player of data.player_data) {
        const playerResult = await sql`INSERT INTO playeringame (gameid, userid, kills, playerscore) VALUES (${gameid}, ${player.player_id}, ${player.kills}, ${player.score}) RETURNING *`;
        console.log(playerResult);
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