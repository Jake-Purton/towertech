"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Game {
  gameid: number;
  gamescore: number;
  playerscore: number;
  kills: number;
  towers_placed: number;
  coins_spent: number;
  time: string;
  date: string;
}

interface PlayerData {
  username: string;
  games: Game[];
}

const PlayerLeaderboardContent: React.FC = () => {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const userid = searchParams ? searchParams.get("userid") : null;

  useEffect(() => {
    const fetchPlayerLeaderboard = async () => {
      try {
        const res = await fetch(`/api/playerleaderboard?userid=${userid}`);
        if (!res.ok) {
          throw new Error(`Error: ${res.statusText}`);
        }
        const data = await res.json();
        // if (!data || data.games.length === 0) {
        //   throw new Error("No games found.");
        // }
        setPlayer(data);
      } catch (error) {
        console.error("Failed to fetch player leaderboard:", error);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchPlayerLeaderboard();
    }
  }, [userid]);

  const handleSearch = () => {
    if (searchUser.trim()) {
      router.push(`/player_leaderboard?userid=${searchUser}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleExpand = (gameid: number) => {
    setExpandedGameId(expandedGameId === gameid ? null : gameid);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-orange-400 font-poppins pt-16">
      <Link
        href="/"
        className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
      >
        Back to Home
      </Link>
      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {loading ? "🏅 Player Leaderboard 🏅" : player ? `🏅 ${player.username} 🏅` : "🏅 Player Not Found 🏅"}
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
      ) : player ? (
        <div className="bg-gray-800/50 backdrop-blur-lg shadow-xl rounded-lg p-6 w-[90%] md:w-1/2 mt-4">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="px-6 py-3 rounded-tl-lg">Game ID</th>
                <th className="px-6 py-3">Game Score</th>
                <th className="px-6 py-3">Player Score</th>
                <th className="px-6 py-3 rounded-tr-lg">Details</th>
              </tr>
            </thead>
            <tbody>
              {player.games.map((game, index) => (
                <React.Fragment key={`${game.gameid}-${index}`}>
                  <tr
                    className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none cursor-pointer"
                    onClick={() => toggleExpand(game.gameid)}
                  >
                    <td className="px-6 py-4 text-lg font-medium">{game.gameid}</td>
                    <td className="px-6 py-4 text-lg">{game.gamescore}</td>
                    <td className="px-6 py-4 text-lg">{game.playerscore}</td>
                    <td className="px-6 py-4 text-lg font-bold">
                      {expandedGameId === game.gameid ? "−" : "+"}
                    </td>
                  </tr>
                  {expandedGameId === game.gameid && (
                    <tr>
                      <td colSpan={4} className="bg-gray-800">
                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2">Game Details</h3>
                          <table className="w-full text-center border-collapse">
                            <thead>
                              <tr className="bg-orange-500 text-white">
                                <th className="px-6 py-3">Kills</th>
                                <th className="px-6 py-3">Towers Placed</th>
                                <th className="px-6 py-3">Coins Spent</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none">
                                <td className="px-6 py-4 text-lg">{game.kills}</td>
                                <td className="px-6 py-4 text-lg">{game.towers_placed || 0}</td>
                                <td className="px-6 py-4 text-lg">{game.coins_spent || 0}</td>
                                <td className="px-6 py-4 text-lg">{game.time}</td>
                                <td className="px-6 py-4 text-lg">{game.date}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-lg mt-4">No games found</p>
      )}
    </div>
  );
}

const PlayerLeaderboard: React.FC = () => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PlayerLeaderboardContent />
        </Suspense>
    );
};

export default PlayerLeaderboard;