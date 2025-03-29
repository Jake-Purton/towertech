import jwt from "jsonwebtoken";

function handleMessage(socket) {
  return () => {
    socket.emit("message", `Hello from server`);
  };
}

function handleJoinRoom(socket, roomManager, secret) {
  return ({ userId, roomId, username }) => {

    const currentRoom = roomManager.getUserRoom(userId);
    if (currentRoom) {
      roomManager.removeUserFromRoom(userId, currentRoom);
      socket.leave(currentRoom);

    }

    if (roomManager.getRoom(roomId)) {
      const uIndex = roomManager.addUserToRoom(userId, roomId, username);
      socket.join(roomId);

      var users = roomManager.getUsersInRoom(roomId);
      socket.to(roomId).emit("updateUsers", users);

      const tokenOptions = { expiresIn: '1d' };
      jwt.sign({ uIndex, roomId }, secret, tokenOptions, (err, indexToken) => {
        if (err) {
          console.error("Error creating token:", err);
          return;
        }
        socket.emit("roomJoinSuccess", {username: username, token: indexToken});
      });

    } else {
      socket.emit("RoomErr", "Room number " + roomId + " does not exist");
    }
  };
}

function handleDisconnect(socket, roomManager) {
  return () => {
    const userId = socket.id;
    const currentRoom = roomManager.getUserRoom(userId);
    if (currentRoom) {
      roomManager.removeUserFromRoom(userId, currentRoom);
      socket.leave(currentRoom);
      socket.to(currentRoom).emit("updateUsers", roomManager.getUsersInRoom(currentRoom));
    }
  };
}

export { handleJoinRoom, handleMessage, handleDisconnect };