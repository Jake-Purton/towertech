"use client";

import React, { useState, useEffect } from 'react';
import { socket } from "../../src/socket";

const JoinRoomPage = () => {
  const [roomCode, setRoomCode] = useState('');
  const [users, setUsers] = useState([]);
  const [inputCode, setInputCode] = useState('');

  const joinRoom = () => {
    socket.emit('joinRoom', inputCode);
  };

  useEffect(() => {
    // Listen for updates to the user list
    socket.on('updateUsers', (userList) => {
      setUsers(userList);
    });

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('updateUsers');
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-bold text-orange-500">Successfully joined room</h1>
    </div>
  );
};

export default JoinRoomPage;
