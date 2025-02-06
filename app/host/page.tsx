"use client";

import React, { useEffect, useState } from "react";
import { socket } from "../src/socket";

type User = { userID: string; username: string };

const HostPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!socket.connected) socket.connect(); // Ensure socket is connected before emitting

    socket.emit("createRoom");

    const handleRoomCode = (code: string) => setRoomCode(code);
    const handleUpdateUsers = (userList: User[]) => setUsers(userList);

    socket.on("roomCode", handleRoomCode);
    socket.on("updateUsers", handleUpdateUsers);

    return () => {
      socket.off("roomCode", handleRoomCode);
      socket.off("updateUsers", handleUpdateUsers);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
      <h1 className="text-5xl font-bold text-orange-600 drop-shadow-md">Room Code</h1>

      <div className="flex flex-col items-center gap-10 w-full max-w-lg mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
        {roomCode ? (
          <div className="w-full text-center">
            <div className="mt-2 p-5 border border-gray-600 rounded-xl bg-gray-900 text-3xl font-semibold tracking-widest text-orange-500 shadow-sm">
              {roomCode}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-lg font-medium">Creating room...</p>
        )}

        <div className="w-full">
          <h2 className="text-2xl font-semibold text-orange-500 mb-4 text-center border-b pb-2 border-gray-600">
            Connected Users
          </h2>
          <ul className="space-y-3">
            {users.length > 0 ? (
              users.map((user, index) => (
                <li
                  key={user.userID || index} // Prefer userID if available
                  className="p-4 bg-gray-900 rounded-lg border border-gray-600 transition-all hover:bg-gray-700 shadow-sm text-center text-lg font-medium"
                >
                  <span className="text-orange-500">{user.username}</span>
                </li>
              ))
            ) : (
              <p className="text-gray-400 text-lg text-center">Waiting for users to join...</p>
            )}
          </ul>
        </div>
        <button className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-all">
          Start the Game 
        </button>
      </div>
    </div>
  );
};

export default HostPage;

