"use client";

import React, { useState, useEffect } from 'react';
import { socket } from "../../src/socket";
import { useRouter } from "next/navigation";

const JoinRoomPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  type User = { userID: String, username: String };
  
  useEffect(() => {
    // Listen for updates to the user list
    socket.on('updateUsers', (userList) => {
      console.log("User list updated: ", userList);
      setUsers(userList);
    });
    socket.on("gameStarted", (message) =>{
      // route to a different page
      router.push("/game");
    });

    socket.emit('getUsers');

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('updateUsers');
      socket.off("gameStarted");
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
      <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Successfully joined room</h1>
      <table className="min-w-[50%] max-w-[75%] divide-y divide-gray-600 rounded-lg overflow-hidden border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left font-medium text-orange-500">
              Joined users
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-600">
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
