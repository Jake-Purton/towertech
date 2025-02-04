"use client";

import React, { useEffect, useState } from 'react';
import { socket } from "../src/socket";

const HostPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Request a new room code from the server
    socket.emit('createRoom');

    // Listen for the room code from the server
    socket.on('roomCode', (code) => {
      setRoomCode(code);
    });

    // Listen for updates to the user list
    socket.on('updateUsers', (userList) => {
      setUsers(userList);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('roomCode');
      socket.off('updateUsers');
    };
  }, []);

  return (
    <div>
      <h1>Host Page</h1>
      {roomCode ? (
        <p>Room Code: {roomCode}</p>
      ) : (
        <p>Creating room...</p>
      )}
      <h2>Users in Room:</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default HostPage;
