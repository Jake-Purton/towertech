// Zanye create a page for leaderboard
// it will need to connect to an sql database to get the leaderboard data
// https://nextjs.org/learn/dashboard-app/setting-up-your-database
import { sql } from "@vercel/postgres";

// This is a Server Component that fetches leaderboard data from the database
export default async function LeaderboardPage() {
  // Fetch the top 10 players sorted by score in descending order
  const { rows: players } = await sql`SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10`;

  return (
    // Main container: centers content vertically and applies dark mode styling
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {/* Leaderboard container: adds padding, rounded corners, and shadow effect */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        {/* Leaderboard title with trophy icon */}
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2"></span> Leaderboard
        </h2>

        {/* Display message if there are no players */}
        {players.length === 0 ? (
          <p className="text-gray-400">No players yet</p>
        ) : (
          // Display leaderboard list
          <ul>
            {players.map((player, index) => (
              <li
                key={player.id} // Ensure unique keys for React rendering
                className="border border-gray-600 p-2 rounded mb-2 flex justify-between bg-gray-700 text-white"
              >
                {/* Display player rank and name */}
                <span>#{index + 1} {player.name}</span>
                {/* Display player score */}
                <span>{player.score} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}




