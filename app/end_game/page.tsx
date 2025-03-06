"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Player {
  userid: string;
  name: string;
  kills: number;
  playerscore: number;
}

interface Game {
  gameid: number;
  score: number;
  players: Player[];
}

export default function EndGamePage() {
  const [score, setScore] = useState(0);
  const [waveScore, setWaveScore] = useState(0);
  const [gameData, setGameData] = useState<Game | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameid = searchParams.get("gameID");

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await fetch(`/api/gameleaderboard?gameid=${gameid}`);
        const data = await res.json();
        setGameData(data);
        setScore(data.score);
        setWaveScore(data.waves)

        // setWaveScore(data.players.length); // Assuming waveScore is the number of players
      } catch (error) {
        console.error("Failed to fetch game data:", error);
      }
    };

    if (gameid) {
      fetchGameData();
    }
  }, [gameid]);

  const handlePlayAgain = () => router.push("/host");
  const handleMainMenu = () => router.push("/");
  const handleLeaderboard = () => router.push("/game_leaderboard");

  return (
    <div className="flex items-stretch justify-center min-h-screen bg-gradient-to-br from-black-900 to-black text-white p-8 gap-8">
      {/* Left  - Hall of Fame */}
      <div className="flex-1 max-w-md bg-gray-800/90 p-6 rounded-l-2xl shadow-2xl border-l-8 border-orange-600 backdrop-blur-sm">
        <div className="rotate-0 [writing-mode:vertical-lr] text-orange-500 text-sm mb-4">
          HALL OF FAME
        </div>
        <div className="space-y-4">
          <h2 className="text-xl text-orange-400 text-center mb-4">🌟 Legends</h2>
          <div className="space-y-2">
            {gameData?.players.slice(0, 3).map((player, index) => (
              <div 
                key={`${player.userid}-${index}`}
                className="flex flex-col items-center p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="text-orange-400 text-sm">#{index + 1}</div>
                <div className="text-lg font-bold">{player.name}</div>
                <div className="text-sm text-orange-300">{player.playerscore} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle  - Game Over & Scores */}
      <div className="flex-grow max-w-2xl bg-gray-800/95 p-8 rounded-2xl shadow-2xl border-y-8 border-orange-600 backdrop-blur-sm z-10">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-orange-500 animate-pulse">
            🎮 GAME OVER
          </h1>
          
          {/* Scores Section */}
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="bg-gray-700/50 p-6 rounded-xl border border-orange-500/30">
              <p className="text-sm text-orange-300 mb-2">Total Score</p>
              <p className="text-4xl font-bold text-orange-400">{score}</p>
            </div>
            <div className="bg-gray-700/50 p-6 rounded-xl border border-orange-500/30">
              <p className="text-sm text-orange-300 mb-2">Waves Survived</p>
              <p className="text-4xl font-bold text-orange-400">{waveScore}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handlePlayAgain}
              className="w-full p-4 rounded-xl font-bold transition-all 
              bg-orange-600 hover:bg-orange-700 hover:scale-[1.02] 
              active:scale-95 text-xl"
            >
              🔄 Play Again
            </button>
            
            <button
              onClick={handleMainMenu}
              className="w-full p-4 rounded-xl font-bold transition-all 
              bg-gray-700 hover:bg-gray-600 hover:scale-[1.02] 
              active:scale-95 text-xl"
            >
              🏡 Main Menu
            </button>
          </div>
        </div>
      </div>

      {/* Right Book - Full Leaderboard */}
      <div className="flex-1 max-w-md bg-gray-800/90 p-6 rounded-r-2xl shadow-2xl border-r-8 border-orange-600 backdrop-blur-sm">
        <div className="text-orange-500 text-sm mb-4">LEADERBOARD</div>
        <div className="space-y-4">
          <h2 className="text-xl text-orange-400 text-center mb-4">🏆 Top Players</h2>
          <div className="space-y-2">
            {gameData?.players.map((player, index) => (
              <div 
                key={`${player.userid}-${index}`}
                className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-orange-400 w-8">#{index + 1}</span>
                <span className="flex-1">{player.name}</span>
                <span className="font-bold text-orange-300">{player.playerscore}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleLeaderboard}
            className="w-full mt-4 p-3 rounded-lg font-bold transition-all 
            bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] text-sm"
          >
            View Full Rankings →
          </button>
        </div>
      </div>
    </div>
  );
}