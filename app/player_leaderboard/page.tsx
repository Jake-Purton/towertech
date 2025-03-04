"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Game {
  gameid: number;
  score: number;
  kills: number;
  playerscore: number;
}

export default function PlayerLeaderboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const userid = searchParams.get("userid");

  useEffect(() => {
    const fetchPlayerLeaderboard = async () => {
      try {
        const res = await fetch(`/api/playerleaderboard?userid=${userid}`);
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error("Failed to fetch player leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchPlayerLeaderboard();
    }
  }, [userid]);

  const handleSearch = () => {
    if (searchUser) {
      router.push(`/player_leaderboard?userid=${searchUser}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-orange-400 font-poppins pt-16">
      <a
        href="/"
        className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
      >
        Back to Home
      </a>
      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🏅 Player Leaderboard 🏅
      </motion.h1>

      <div className="w-1/3 mb-4 flex items-center">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-orange-500 bg-black text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="🔍 Enter User ID..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
        >
          ➔
        </button>
      </div>

      {loading ? (
        <p className="text-lg mt-4 animate-pulse">Loading...</p>
      ) : games.length === 0 ? (
        <p className="text-lg mt-4">No games found</p>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-lg shadow-xl rounded-lg p-6 w-[90%] md:w-1/2 mt-4">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="px-6 py-3 rounded-tl-lg">Game ID</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Kills</th>
                <th className="px-6 py-3 rounded-tr-lg">Player Score</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => (
                <tr
                  key={`${game.gameid}-${index}`}
                  className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none"
                >
                  <td className="px-6 py-4 text-lg font-medium">{game.gameid}</td>
                  <td className="px-6 py-4 text-lg">{game.score}</td>
                  <td className="px-6 py-4 text-lg">{game.kills}</td>
                  <td className="px-6 py-4 text-lg">{game.playerscore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
