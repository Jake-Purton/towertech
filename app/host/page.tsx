"use client";

import React, { useEffect, useState } from "react";
import { socket } from "../src/socket";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';

type User = { userID: string; username: string };

const HostPage = () => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [ipAddress, setIpAddress] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  
  useEffect(() => {
    // Get IP address
    const getIPAddress = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/getip');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Failed to get IP address:', error);
      }
    };

    if (!socket.connected) socket.connect();
    socket.emit("createRoom");
    getIPAddress();

    const handleRoomCode = (data) => {
      console.log("Room code received:", data);
      setRoomCode(data.roomCode);
      localStorage.setItem("roomToken", data.roomToken);
    };
    const handleUpdateUsers = (userList: User[]) => setUsers(userList);

    socket.on("roomCode", handleRoomCode);
    socket.on("updateUsers", handleUpdateUsers);

    return () => {
      socket.off("roomCode", handleRoomCode);
      socket.off("updateUsers", handleUpdateUsers);
    };
  }, []);

  // Create the URL for the QR code
  const joinUrl = ipAddress ? `http://${ipAddress}:3000/join?roomCode=${roomCode}` : '';

  const startGame = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    if (users.length > 0 && !gameStarted) {
      setGameStarted(true);
      router.push("/game");
      localStorage.setItem("roomCode", roomCode);
      // socket.emit("gameStarted", roomCode)
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
      <h1 className="text-5xl font-bold text-orange-600 drop-shadow-md">Room Code</h1>

      <div className="flex flex-col items-center gap-10 w-full max-w-lg mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
        {roomCode && (
          <>
            <div className="w-full text-center">
              <div className="mt-2 p-5 border border-gray-600 rounded-xl bg-gray-900 text-3xl font-semibold tracking-widest text-orange-500 shadow-sm">
                {roomCode}
              </div>
            </div>
            
            {/* QR Code Section */}
            {ipAddress && (
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={joinUrl}
                  size={200}
                  level="L"
                />
              </div>
            )}
            
            <p className="text-sm text-gray-400">
              Join URL: {joinUrl}
            </p>
          </>
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
        <button
          className={`mt-6 px-4 py-2 rounded-lg shadow-md transition-all ${
            users.length === 0 || gameStarted ? "bg-gray-600 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
          } text-white`}
          disabled={users.length === 0 || gameStarted}
          onClick={startGame}
        >
          Start the Game
        </button>
      </div>
    </div>
  );
};

export default HostPage;

