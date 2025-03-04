import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        gameleaderboard.gameid,
        gameleaderboard.score,
        playeringame.userid,
        playeringame.kills,
        playeringame.playerscore,
        users.name
      FROM 
        gameleaderboard
      JOIN 
        playeringame ON gameleaderboard.gameid = playeringame.gameid
      JOIN 
        users ON playeringame.userid = users.id
      ORDER BY 
        gameleaderboard.score DESC;
    `;

    // Transform the result into a two-dimensional array
    const games = result.rows.reduce((acc, row) => {
      const gameIndex = acc.findIndex(game => game.gameid === row.gameid);
      const playerData = {
        userid: row.userid,
        name: row.name,
        kills: row.kills,
        playerscore: row.playerscore
      };

      if (gameIndex === -1) {
        acc.push({
          gameid: row.gameid,
          score: row.score,
          players: [playerData]
        });
      } else {
        acc[gameIndex].players.push(playerData);
      }

      return acc;
    }, []);

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}