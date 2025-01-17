function handleMessage(socket) {
  return (msg) => {
    console.log("Received message:", msg);
    socket.emit("message", `Hello from server`);
  };
}

function handleJakeyMessage(socket) {
  return (msg) => {
    console.log("Received Jakey message:", msg.message);
    console.log("Received Jakey message:", msg.number);
  };
}

function handleJoinRoom(socket, roomManager) {
  return ({ userId, roomId }) => {
    console.log(userId, "attempting to join room", roomId);

    const currentRoom = roomManager.getUserRoom(userId);
    if (currentRoom) {
      roomManager.removeUserFromRoom(userId, currentRoom);
      socket.leave(currentRoom);

      console.log(userId, "was already in room", currentRoom, "leaving room");
    }

    if (roomManager.getRoom(roomId)) {
      roomManager.addUserToRoom(userId, roomId);
      socket.join(roomId);

      console.log(userId, "joined room", roomId);
      socket.to(roomId).emit("updateUsers", roomManager.getUsersInRoom(roomId));
    } else {
      socket.emit("RoomErr", "Room number " + roomId + " does not exist");
    }
  };
}

export { handleJoinRoom, handleMessage, handleJakeyMessage };