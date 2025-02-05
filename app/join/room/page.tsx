"use client";

import React, { useState, useEffect } from 'react';
import { socket } from "../../src/socket";

const JoinRoomPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  type User = { userID: String, username: String };
  
  useEffect(() => {
    // Listen for updates to the user list
    socket.on('updateUsers', (userList) => {
      console.log("User list updated: ", userList);
      setUsers(userList);
    });

    socket.emit('getUsers');

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('updateUsers');
    };
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-orange-500">Successfully joined room</h1>
      <table className="min-w-[50%] max-w-[75%] divide-y divide-orange-500 rounded-lg overflow-hidden border border-orange-500 rounded-lg">
        <thead className="bg-black">
          <tr>
            <th scope="col" className="px-6 py-3 text-left font-medium text-orange-500">
              Joined users
            </th>
          </tr>
        </thead>
        <tbody className="bg-black divide-y divide-orange-500">
          {users.map((user, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-500">{user.username}</td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
};

export default JoinRoomPage;
