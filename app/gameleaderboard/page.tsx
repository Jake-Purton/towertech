"use client";

import { useEffect, useState } from "react";

interface Game {
  gameid: number;
  score: number;
}

export default function GameLeaderboard() {
  // State to store game leaderboard data
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch game leaderboard data from the API when the component mounts
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/gameleaderboard");
        const data = await res.json();
        setGames(data);  // Update state with the fetched data
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);  // Stop loading after fetching data
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    // Main container with a black background and orange text
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-orange-400">
      <h1 className="text-3xl font-bold mb-6">🎮 Game Leaderboard 🏆</h1>

      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : (
        <table className="w-1/2 text-center">
          <thead>
            <tr className="bg-gray-800 text-orange-300">
              <th className="px-4 py-2">Game ID</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.gameid} className="bg-gray-900 hover:bg-gray-700 transition">
                <td className="px-4 py-2">{game.gameid}</td>
                <td className="px-4 py-2">{game.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
