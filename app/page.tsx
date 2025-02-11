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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src="/towertech_logo.png"
          alt="Tower Tech logo"
          width={256}
          height={175}
          priority
        />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/host"
          >
            Host
          </a>
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/join"
          >
            Join
          </a>
        </div>
      </main>
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