"use client";

import { useEffect, useState } from "react";

interface PlayerInGame {
  gameid: number;
  player_name: string;
  kills: number;
  playerscore: number;
}

export default function PlayerInGamePage() {
  const [players, setPlayers] = useState<PlayerInGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        const res = await fetch("/api/playeringame");
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch player game data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-orange-400">
      <h1 className="text-3xl font-bold mb-6">🎮 Player In Game 🏆</h1>
      {loading ? (
        <p className="text-lg">Loading...</p>
      ) : (
        <table className="w-3/4 text-center">
          <thead>
            <tr className="bg-gray-800 text-orange-300">
              <th className="px-4 py-2">Game ID</th>
              <th className="px-4 py-2">Player Name</th>
              <th className="px-4 py-2">Kills</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={`${player.gameid}-${player.player_name}`} className="bg-gray-900 hover:bg-gray-700 transition">
                <td className="px-4 py-2">{player.gameid}</td>
                <td className="px-4 py-2">{player.player_name}</td>
                <td className="px-4 py-2">{player.kills}</td>
                <td className="px-4 py-2">{player.playerscore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
