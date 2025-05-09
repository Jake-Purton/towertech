// a user in room is 
// userID -> socket id
// username
// usersUserID -> Database id
// the index in the list which is another way they can be identified

// Represents a room
class Room {
  // Creates a room with a given name
  constructor(name) {
    this.users = []; // list of users in the room
    this.roomName = name; // name of the room
  }

  // Adds a user to the room, returns the index in the room list
  addUser(userID, username, usersUserID) {
    const i = this.users.push({userID, username, usersUserID});
    return i-1;
  }

  swapSocketID(index, newID) {
    this.users[index].userID = newID;
  }

  // Removes a user from the room
  removeUser(user) {
    this.users = this.users.filter(u => u.userID !== user);
  }

  // Gets the list of users in the room
  getUsers() {
    // returns the {userID, username, userUserID} triples
    return this.users;
  }
}

class RoomManager {
  constructor() {
    // dictionary of rooms
    this.rooms = {};
  }

  generateRandomRoomName() {
    // random integer from 0 to 999_999
    let name = Math.floor(Math.random() * 999_999).toString();
    while (name.length < 6) {
      name = "0" + name;
    }
    return name;
  }

  createRoomWithRandomName() {
    var name = this.generateRandomRoomName();
    // while the name already exists
    while (this.rooms[name]) {
      // generate a new name
      name = this.generateRandomRoomName();
    }

    // create the room
    this.createRoom(name);
    return name;
  }
  createRoom(name) {
    if (!this.rooms[name]) {
      // create a new room with that name
      this.rooms[name] = new Room(name);
    }
  }

  deleteRoom(name) {
    delete this.rooms[name];
  }

  getRoom(name) {
    return this.rooms[name];
  }

  addUserToRoom(userId, roomName, username) {
    if (this.rooms[roomName]) {
      return this.rooms[roomName].addUser(userId, username, null);
    }
  }

  addUserToRoomAuth(userId, roomName, username, usersUserID) {
    if (this.rooms[roomName]) {
      return this.rooms[roomName].addUser(userId, username, usersUserID);
    }
  }

  removeUserFromRoom(userId, roomName) {
    if (this.rooms[roomName]) {
      this.rooms[roomName].removeUser(userId);
    }
  }

  swapSocketID(index, roomName, newID) {
    // console.log("swapping")
    if (this.rooms[roomName]) {
      // console.log("here 200")
      const oldID = this.rooms[roomName].users[index].userID;
      console.log("roomsjs old: " + oldID)
      console.log("roomsjs new: " + newID)
      if (oldID === newID) {
        console.log("NULLNULL rooms.js")
        return null;
      } else {
        console.log("YESYES rooms.js")
        console.log("roomsjs old: " + oldID + " roomsjs new: " + newID);

        this.rooms[roomName].swapSocketID(index, newID);
        return { oldID, newID };
      }
    }
  }

  getUsersInRoom(roomName) {
    if (this.rooms[roomName]) {
      // return a list of {userID, username usersUserID} triples
      return this.rooms[roomName].getUsers();
    }
    return [];
  }

  getUserRoom(userId) {
    // iterate through all room names
    for (const roomName in this.rooms) {

      // if the user is in the room
      var userPairs = this.rooms[roomName].getUsers();

      for (const userPair of userPairs) {
        if (userPair.userID === userId) {
          return roomName;
        }
      }

    }
    return null;
  }
}

export { RoomManager };