import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get("userid");

  if (!userid) {
    return NextResponse.json({ error: "Missing userid parameter" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT 
        gameleaderboard.gameid,
        gameleaderboard.score,
        playeringame.kills,
        playeringame.playerscore
      FROM 
        gameleaderboard
      JOIN 
        playeringame ON gameleaderboard.gameid = playeringame.gameid
      WHERE 
        playeringame.userid = ${userid} AND playeringame.playerscore IS NOT NULL
      ORDER BY 
        playeringame.playerscore DESC;
    `;

    const games = result.rows.map(row => ({
      gameid: row.gameid,
      score: row.score,
      kills: row.kills,
      playerscore: row.playerscore
    }));

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching player leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch player leaderboard" }, { status: 500 });
  }
}
