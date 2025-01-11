class Room {
  constructor(name) {
    this.users = [];
    this.name = name;
  }

  addUser(user) {
    this.users.push(user);
  }

  removeUser(user) {
    this.users = this.users.filter(u => u !== user);
  }

  getUsers() {
    return this.users;
  }
}

class RoomManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(name) {
    if (!this.rooms[name]) {
      this.rooms[name] = new Room(name);
    }
  }

  deleteRoom(name) {
    delete this.rooms[name];
  }

  getRoom(name) {
    return this.rooms[name];
  }

  addUserToRoom(userId, roomName) {
    if (this.rooms[roomName]) {
      this.rooms[roomName].addUser(userId);
    }
  }

  removeUserFromRoom(userId, roomName) {
    if (this.rooms[roomName]) {
      this.rooms[roomName].removeUser(userId);
    }
  }

  getUsersInRoom(roomName) {
    if (this.rooms[roomName]) {
      return this.rooms[roomName].getUsers();
    }
    return [];
  }

  getUserRoom(userId) {
    for (const roomName in this.rooms) {
      if (this.rooms[roomName].getUsers().includes(userId)) {
        return roomName;
      }
    }
    return null;
  }
}

export { RoomManager };