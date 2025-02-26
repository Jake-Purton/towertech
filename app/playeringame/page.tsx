"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface PlayerInGame {
  gameid: number;
  player_name: string;
  kills: number;
  playerscore: number;
}

export default function PlayerInGamePage() {
  const [players, setPlayers] = useState<PlayerInGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // State for search input
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const res = await fetch("/api/playeringame");
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch player game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
    const interval = setInterval(fetchPlayerData, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup to avoid memory leaks
  }, []);

  // Filter players based on search input
  const filteredPlayers = players.filter((player) =>
    player.player_name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);

  // Get paginated players for the current page
  const paginatedPlayers = useMemo(() => {
    return filteredPlayers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredPlayers, currentPage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-orange-400 font-poppins">
      {/* Animated Page Title */}
      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎮 Player In Game 🏆
      </motion.h1>

      {/* 🔍 Search Input */}
      <input
        type="text"
        className="w-1/3 px-4 py-2 rounded-lg border border-orange-500 bg-black text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="🔍 Search Player Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-lg mt-4 animate-pulse">Loading...</p>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-lg shadow-xl rounded-lg p-6 w-[90%] md:w-3/4 mt-4">
          {/* Table for displaying player data */}
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="px-6 py-3 rounded-tl-lg">Game ID</th>
                <th className="px-6 py-3">Player Name</th>
                <th className="px-6 py-3">Kills</th>
                <th className="px-6 py-3 rounded-tr-lg">Score</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player, index) => (
                <motion.tr
                  key={`${player.gameid}-${player.player_name}`}
                  className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4">{player.gameid}</td>
                  <td className="px-6 py-4 font-semibold">{player.player_name}</td>
                  <td className="px-6 py-4">{player.kills}</td>
                  <td className="px-6 py-4">{player.playerscore}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all"
            >
              Previous
            </button>

            <span className="text-orange-300 text-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
