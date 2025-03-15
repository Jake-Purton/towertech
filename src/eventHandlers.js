function handleMessage(socket) {
  return () => {
    // console.log("Received message:", msg);
    socket.emit("message", `Hello from server`);
  };
}

function handleJoinRoom(socket, roomManager) {
  return ({ userId, roomId, username }) => {
    console.log(userId, "attempting to join room", roomId, "with username", username);

    const currentRoom = roomManager.getUserRoom(userId);
    if (currentRoom) {
      roomManager.removeUserFromRoom(userId, currentRoom);
      socket.leave(currentRoom);

      console.log(userId, "was already in room", currentRoom, "leaving room");
    }

    if (roomManager.getRoom(roomId)) {
      roomManager.addUserToRoom(userId, roomId, username);
      socket.join(roomId);

      console.log(userId, "joined room", roomId);
      var users = roomManager.getUsersInRoom(roomId);
      socket.to(roomId).emit("updateUsers", users);

      socket.emit("roomJoinSuccess", "Successfully joined room " + roomId);
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
      // console.log(userId, "disconnected and removed from room", currentRoom);
      socket.to(currentRoom).emit("updateUsers", roomManager.getUsersInRoom(currentRoom));
    }
  };
}

export { handleJoinRoom, handleMessage, handleDisconnect };