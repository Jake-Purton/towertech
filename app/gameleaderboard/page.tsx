"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface Game {
  gameid: number;
  score: number;
}

export default function GameLeaderboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/gameleaderboard");
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = games.filter((game) =>
    game.gameid.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

  const paginatedGames = useMemo(() => {
    return filteredGames.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredGames, currentPage]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-orange-400 font-poppins">
      <motion.h1
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎮 Game Leaderboard 🏆
      </motion.h1>

      <input
        type="text"
        className="w-1/3 px-4 py-2 rounded-lg border border-orange-500 bg-black text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder="🔍 Search Game ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-lg mt-4 animate-pulse">Loading...</p>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-lg shadow-xl rounded-lg p-6 w-[90%] md:w-1/2 mt-4">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="px-6 py-3 rounded-tl-lg">Game ID</th>
                <th className="px-6 py-3 rounded-tr-lg">Score</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGames.map((game) => (
                <tr
                  key={game.gameid}
                  className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none"
                >
                  <td className="px-6 py-4 text-lg font-medium">{game.gameid}</td>
                  <td className="px-6 py-4 text-lg">{game.score}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* paging button */}
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


