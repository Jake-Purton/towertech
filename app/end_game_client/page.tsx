"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const EndGameClientPageContent = () => {
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [kills, setKills] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const gameid = searchParams?.get("gameid") || '';
  const playerid = searchParams?.get("playerid") || '';

  useEffect(() => {
    const fetchGameData = async () => {
      console.log("HERE");
      try {
        const res = await fetch(`/api/playerData?playerid=${playerid}&gameid=${gameid}`);
        const data = await res.json();
        console.log(data)
        setScore(data.playerscore);
        setUsername(data.username);
        setKills(data.kills);


      } catch (error) {
        console.error("Failed to fetch player data:", error);
      }
    };

    if (gameid && playerid) {
      fetchGameData();
    }
  }, [gameid, playerid]);

  const handlePlayAgain = () => router.push("/join");
  const handleMainMenu = () => router.push("/");

  return (
    <div className="flex items-stretch justify-center min-h-screen bg-gradient-to-br from-black-900 to-black text-white p-8 gap-8">
      
      {/* Middle  - Game Over & Scores */}
      <div className="flex-grow max-w-2xl bg-gray-800/95 p-8 rounded-2xl shadow-2xl border-y-8 border-orange-600 backdrop-blur-sm z-10">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-orange-500 animate-pulse">
            Your ({username}) Stats
          </h1>
          
          {/* Scores Section */}
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="bg-gray-700/50 p-6 rounded-xl border border-orange-500/30">
              <p className="text-sm text-orange-300 mb-2">Your Score</p>
              <p className="text-4xl font-bold text-orange-400">{score}</p>
            </div>
            <div className="bg-gray-700/50 p-6 rounded-xl border border-orange-500/30">
              <p className="text-sm text-orange-300 mb-2">Your Kills</p>
              <p className="text-4xl font-bold text-orange-400">{kills}</p>
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
    </div>
  );
}

export default function EndGameClientPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EndGameClientPageContent />
    </Suspense>
  );
}