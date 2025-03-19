
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Player {
  userid: string;
  name: string;
  kills: number;
  playerscore: number;
  username: string;
}

interface Game {
  gameid: number;
  score: number;
  players: Player[];
}

export default function GameLeaderboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedMap, setSelectedMap] = useState<string>("All");
  const itemsPerPage = 10;
  const router = useRouter();

  const handleDifficultyClick = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    localStorage.setItem("gameDifficulty", difficulty);
  };

  const handleMapClick = (map: string) => {
    setSelectedMap(map);
    localStorage.setItem("gameMap", map);
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const difficultyQuery = selectedDifficulty !== "All" ? `difficulty=${selectedDifficulty}` : "";
        const mapQuery = selectedMap !== "All" ? `map=${selectedMap.split(" ")[1]}` : "";
        const query = [difficultyQuery, mapQuery].filter(Boolean).join("&");
        const res = await fetch(`/api/gameleaderboard?${query}`);
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
  }, [selectedDifficulty, selectedMap]);

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

  const toggleExpand = (gameid: number) => {
    setExpandedGameId(expandedGameId === gameid ? null : gameid);
  };

  const handlePlayerClick = (userid: string) => {
    router.push(`/player_leaderboard?userid=${userid}`);
  };

  return (
    <>
      <Link
        href="/"
        className="absolute bottom-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
      >
        Back to Home
      </Link>
      <div className="flex flex-row gap-2 mt-2 mb-2">
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
        <div className="relative w-full h-24">
          <button
            className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
              selectedMap === "All" ? "border-2 border-orange-600" : "border-2 border-transparent"
            }`}
            style={{backgroundColor: "lightgray" }}
            onClick={() => handleMapClick("All")}
          >
          </button>
          <p 
            className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
            onClick={() => handleMapClick("All")}
          >
            All Levels
          </p>
        </div>
      </div>
      {/* START OF THE DIFFICULTY SELECTOR */}
      <div className="flex flex-row gap-2 mt-2 mb-2">
        <div className="relative w-full h-24">
          <button
            className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
              selectedDifficulty === "Hard" ? "border-2 border-black-600" : "border-2 border-transparent"
            }`}
            style={{backgroundColor: "red" }}
            onClick={() => handleDifficultyClick("Hard")}
          >
          </button>
          <p 
            className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
            onClick={() => handleDifficultyClick("Hard")}
          >
            Hard
          </p>
        </div>
        <div className="relative w-full h-24">
          <button
            className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
              selectedDifficulty === "Medium" ? "border-2 border-black-600" : "border-2 border-transparent"
            }`}
            style={{ backgroundColor: "orange"}}
            onClick={() => handleDifficultyClick("Medium")}
          >
          </button>
          <p 
            className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
            onClick={() => handleDifficultyClick("Medium")}
          >
            Medium
          </p>
        </div>
        <div className="relative w-full h-24">
          <button
            className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
              selectedDifficulty === "Easy" ? "border-2 border-black-600" : "border-2 border-transparent"
            }`}
            style={{backgroundColor: "green" }}
            onClick={() => handleDifficultyClick("Easy")}
          >
          </button>
          <p 
            className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
            onClick={() => handleDifficultyClick("Easy")}
          >
            Easy
          </p>
        </div>
        <div className="relative w-full h-24">
          <button
            className={`w-full h-full bg-cover bg-center rounded-lg shadow-md transition-all ${
              selectedDifficulty === "All" ? "border-2 border-orange-600" : "border-2 border-transparent"
            }`}
            style={{backgroundColor: "lightgray" }}
            onClick={() => handleDifficultyClick("All")}
          >
          </button>
          <p 
            className="absolute inset-0 flex items-center justify-center text-black text-xl font-bold" 
            onClick={() => handleDifficultyClick("All")}
          >
            All Difficulties
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-orange-400 font-poppins pt-16">
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
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGames.map((game) => (
                  <React.Fragment key={game.gameid}>
                    <tr
                      className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none cursor-pointer"
                      onClick={() => toggleExpand(game.gameid)}
                    >
                      <td className="px-6 py-4 text-lg font-medium">{game.gameid}</td>
                      <td className="px-6 py-4 text-lg">{game.score}</td>
                      <td className="px-6 py-4 text-lg">{expandedGameId === game.gameid ? "-" : "+"}</td>
                    </tr>
                    {expandedGameId === game.gameid && (
                      <tr>
                        <td colSpan={3} className="bg-gray-800">
                          <div className="p-4">
                            <h3 className="text-xl font-bold mb-2">Players</h3>
                            <table className="w-full text-center border-collapse">
                              <thead>
                                <tr className="bg-orange-500 text-white">
                                  <th className="px-6 py-3">User ID</th>
                                  <th className="px-6 py-3">Name</th>
                                  <th className="px-6 py-3">Kills</th>
                                  <th className="px-6 py-3">Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {game.players.map((player, index) => (
                                  <tr
                                    key={player.userid === "0" ? `guest-${index}` : player.userid}
                                    className="bg-gray-900 hover:bg-gray-700 transition-all duration-300 border-b border-gray-700 last:border-none cursor-pointer"
                                    onClick={() => handlePlayerClick(player.userid)}
                                  >
                                    <td className="px-6 py-4 text-lg font-medium">{player.userid=== "0" ? `Guest` : player.userid}</td>
                                    <td className="px-6 py-4 text-lg">{player.username}</td>
                                    <td className="px-6 py-4 text-lg">{player.kills}</td>
                                    <td className="px-6 py-4 text-lg">{player.playerscore}</td>
                                  </tr>
                                ))}
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
    </>
  );
}
