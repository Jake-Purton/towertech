import { randomUUID } from "node:crypto";

// a user in room is
// userID -> socket id (changes if the player reconnects after the recovery window)
// username
// usersUserID -> Database id
// seatID -> stable id for the player's place in the room, stored in their index token
// previousIDs -> socket ids this player has had before, so a reconnecting host can be told about them

// Represents a room
class Room {
  // Creates a room with a given name, hosted by the given socket
  constructor(name, hostSocketId) {
    this.users = []; // list of users in the room
    this.roomName = name; // name of the room
    this.hostSocketId = hostSocketId; // socket running the game, all player input is sent here
    this.cleanupTimer = null; // pending deletion while the host is disconnected
  }

  // Adds a user to the room, returns the seat id that identifies them from now on
  addUser(userID, username, usersUserID) {
    const seatID = randomUUID();
    this.users.push({ userID, username, usersUserID, seatID, previousIDs: [] });
    return seatID;
  }

  getUser(userID) {
    return this.users.find(u => u.userID === userID);
  }

  getUserBySeat(seatID) {
    return this.users.find(u => u.seatID === seatID);
  }

  // Removes a user from the room
  removeUser(userID) {
    this.users = this.users.filter(u => u.userID !== userID);
  }

  // Gets the list of users in the room
  getUsers() {
    // returns the {userID, username, usersUserID} triples
    return this.users.map(({ userID, username, usersUserID }) => ({ userID, username, usersUserID }));
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // room name -> Room
    this.userRooms = new Map(); // player socket id -> room name, avoids scanning every room per message
  }

  generateRandomRoomName() {
    // random integer from 0 to 999_999
    return Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
  }

  createRoomWithRandomName(hostSocketId) {
    let name = this.generateRandomRoomName();
    // while the name already exists
    while (this.rooms.has(name)) {
      // generate a new name
      name = this.generateRandomRoomName();
    }

    this.rooms.set(name, new Room(name, hostSocketId));
    return name;
  }

  deleteRoom(name) {
    const room = this.rooms.get(name);
    if (!room) {
      return;
    }
    clearTimeout(room.cleanupTimer);
    for (const user of room.users) {
      this.userRooms.delete(user.userID);
    }
    this.rooms.delete(name);
  }

  getRoom(name) {
    return this.rooms.get(name);
  }

  getRoomHostedBy(socketId) {
    for (const room of this.rooms.values()) {
      if (room.hostSocketId === socketId) {
        return room.roomName;
      }
    }
    return null;
  }

  isHost(socketId, roomName) {
    const room = this.rooms.get(roomName);
    return Boolean(room) && room.hostSocketId === socketId;
  }

  setHost(roomName, socketId) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.hostSocketId = socketId;
      this.cancelCleanup(roomName);
    }
  }

  // delete the room after `delay` ms unless the host comes back first
  scheduleCleanup(roomName, delay, onExpire) {
    const room = this.rooms.get(roomName);
    if (room) {
      clearTimeout(room.cleanupTimer);
      room.cleanupTimer = setTimeout(onExpire, delay);
      room.cleanupTimer.unref();
    }
  }

  cancelCleanup(roomName) {
    const room = this.rooms.get(roomName);
    if (room) {
      clearTimeout(room.cleanupTimer);
      room.cleanupTimer = null;
    }
  }

  // returns the user's seat id, or undefined if the room does not exist
  addUserToRoom(userId, roomName, username, usersUserID = null) {
    const room = this.rooms.get(roomName);
    if (room) {
      this.userRooms.set(userId, roomName);
      return room.addUser(userId, username, usersUserID);
    }
  }

  removeUserFromRoom(userId, roomName) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.removeUser(userId);
      this.userRooms.delete(userId);
    }
  }

  // point the player in `seatID` at a new socket, returns {oldID, newID} if anything changed
  swapSocketID(seatID, roomName, newID) {
    const room = this.rooms.get(roomName);
    const user = room?.getUserBySeat(seatID);
    if (!user || user.userID === newID) {
      return null;
    }
    const oldID = user.userID;
    user.previousIDs.push(oldID);
    user.userID = newID;
    this.userRooms.delete(oldID);
    this.userRooms.set(newID, roomName);
    return { oldID, newID };
  }

  // every {oldID, newID} pair for the room, for a host that may have missed some swaps while disconnected
  getSocketIDHistory(roomName) {
    const room = this.rooms.get(roomName);
    if (!room) {
      return [];
    }
    return room.users.flatMap(user => user.previousIDs.map(oldID => ({ oldID, newID: user.userID })));
  }

  getUsersInRoom(roomName) {
    const room = this.rooms.get(roomName);
    // return a list of {userID, username usersUserID} triples
    return room ? room.getUsers() : [];
  }

  getUserRoom(userId) {
    return this.userRooms.get(userId) ?? null;
  }
}

export { RoomManager };
