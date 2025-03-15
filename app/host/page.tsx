"use client";

import React, { useEffect, useState } from "react";
import { socket } from "../src/socket";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';
import Link from "next/link";

type User = { userID: string; username: string };

const HostPage = () => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [ipAddress, setIpAddress] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Medium");
  const [selectedMap, setSelectedMap] = useState<string>("level 1");

  const handleDifficultyClick = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    localStorage.setItem("gameDifficulty", difficulty);
  };

  const handleMapClick = (map: string) => {
    setSelectedMap(map);
    localStorage.setItem("gameMap", map);
  };
  
  useEffect(() => {
    // Get IP address
    const getIPAddress = async () => {
      try {
        const response = await fetch('/api/getip');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Failed to get IP address:', error);
      }
    };

    handleDifficultyClick("Medium")
    handleMapClick("level 2");

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

  const startGame = (): void => {
    if (users.length > 0 && !gameStarted) {
      setGameStarted(true);
      router.push("/game");
      localStorage.setItem("roomCode", roomCode);
      // socket.emit("gameStarted", roomCode)
    }
  };
  return (
    <div className="flex items-stretch justify-center min-h-screen bg-gradient-to-br from-black-900 to-black text-white p-8 gap-8">
      {/* LEFT */}
      <div className="flex-1 max-w-md bg-gray-800/90 p-6 rounded-l-2xl shadow-2xl border-l-8 border-orange-600 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4 text-center border-b pb-2 border-gray-600">
          Level Modifiers
        </h2>
        <p className="text-lg font-medium text-center text-gray-300 mb-4">
          Select Difficulty
        </p>
        <div className="flex gap-0 mt-2 mb-2 justify-center">
          <button
            className={`px-4 py-2 rounded-l-lg shadow-md transition-all bg-black hover:bg-gray-700 text-white text-lg border-2 ${
              selectedDifficulty === "Easy" ? "border-orange-600" : "border-transparent"
            }`}
            onClick={() => handleDifficultyClick("Easy")}
          >
            Easy
          </button>
          <button
            className={`px-4 py-2 shadow-md transition-all bg-black hover:bg-gray-700 text-white text-lg border-2 ${
              selectedDifficulty === "Medium" ? "border-orange-600" : "border-transparent"
            }`}
            onClick={() => handleDifficultyClick("Medium")}
          >
            Medium
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg shadow-md transition-all bg-black hover:bg-gray-700 text-white text-lg border-2 ${
              selectedDifficulty === "Hard" ? "border-orange-600" : "border-transparent"
            }`}
            onClick={() => handleDifficultyClick("Hard")}
          >
            Hard
          </button>
        </div>
        <p className="text-lg font-medium text-center text-gray-300 mb-4">
          Select Map
        </p>
        <div className="flex flex-col gap-2 mt-2 mb-2 justify-center items-center">
          <div className="relative w-full h-24">
            <button
              className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
                selectedMap === "level 1" ? "border-2 border-orange-600" : "border-2 border-transparent"
              }`}
              style={{ backgroundImage: "url('/game_images/background_1.png')" }}
              onClick={() => handleMapClick("level 1")}
            >
            </button>
            <p 
              className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
              onClick={() => handleMapClick("level 1")}
            >
              Level 1
            </p>
          </div>
          <div className="relative w-full h-24">
            <button
              className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
                selectedMap === "level 2" ? "border-2 border-orange-600" : "border-2 border-transparent"
              }`}
              style={{ backgroundImage: "url('/game_images/background_2.png')" }}
              onClick={() => handleMapClick("level 2")}
            >
            </button>
            <p 
              className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
              onClick={() => handleMapClick("level 2")}
            >
              Level 2
            </p>
          </div>
          <div className="relative w-full h-24">
            <button
              className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
                selectedMap === "level 3" ? "border-2 border-orange-600" : "border-2 border-transparent"
              }`}
              style={{ backgroundImage: "url('/game_images/background_3.png')" }}
              onClick={() => handleMapClick("level 3")}
            >
            </button>
            <p 
              className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
              onClick={() => handleMapClick("level 3")}
            >
              Level 3
            </p>
          </div>
        </div>
      </div>
      {/* MIDDLE */}
      <div className="flex-grow max-w-2xl bg-gray-800/95 p-8 rounded-2xl shadow-2xl border-y-8 border-orange-600 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
        
        <h1 className="text-5xl font-bold text-orange-600 drop-shadow-md">Room Code</h1>

        <div className="flex flex-col items-center gap-10 w-full max-w-lg mt-10">
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
                    size={300}
                    level="L"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-400">
                Join URL: {joinUrl}
              </p>
            </>
          )}
          <div className="flex gap-4 mt-6">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg shadow-md transition-all bg-black hover:bg-orange-900 text-white text-2xl"
            >
              Back to Home
            </Link>
            <button
              className={`px-4 py-2 rounded-lg shadow-md transition-all ${
                users.length === 0 || gameStarted ? "bg-gray-600 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              } text-white text-2xl`} // Further increased font size
              disabled={users.length === 0 || gameStarted}
              onClick={startGame}
            >
              Start the Game
            </button>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex-1 max-w-md bg-gray-800/90 p-6 rounded-r-2xl shadow-2xl border-r-8 border-orange-600 backdrop-blur-sm">
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
      </div>
    </div>
  );
};

export default HostPage;

