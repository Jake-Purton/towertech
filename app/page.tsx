"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (user) {
        setUser(JSON.parse(user));
      }
      if (token && await verifyToken(token)) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
      {!isLoading && (
        <div className="absolute top-4 left-4 flex gap-4">
          {isLoggedIn ? (
            <>
              <p>Signed in as {user.name}.</p>
              <button
                onClick={handleLogout}
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Sign out?
              </button>
            </>
          ) : (
            <ul>
              <li>
                <a href="/login" className="text-orange-600 hover:text-orange-700 underline">
                Login
                </a>
              </li> 
              <li>
                <a href="/register" className="text-orange-600 hover:text-orange-700 underline">
                Register
                </a>
              </li>
            </ul>
          )}
        </div>
      )}
      <Image
        src="/towertech_logo.png"
        alt="Tower Tech logo"
        width={256}
        height={175}
        priority
      />
      <div className="flex flex-col items-center gap-4 mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4 text-center border-b pb-2 border-gray-600">
          Play
        </h2>
        <a
          className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-8 sm:px-10"
          href="/host"
        >
          Host
        </a>
        <a
          className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-8 sm:px-10"
          href="/join"
        >
          Join
        </a>
        <h2 className="text-2xl font-semibold text-orange-500 mb-4 text-center border-b pb-2 border-gray-600">
          Leaderboards
        </h2>
        <a
          className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-8 sm:px-10"
          href="/game_leaderboard"
        >
          Game Leaderboard
        </a>
      </div>
    </div>
  );
}

async function verifyToken(token: string) {
  try {
    const res = await fetch("/api/checkToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    return data.valid;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}