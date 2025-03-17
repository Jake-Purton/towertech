import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get("userid");

  if (!userid) {
    return NextResponse.json({ error: "Invalid userid parameter" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT 
        users.name AS username,
        playeringame.gameid,
        COALESCE(gameleaderboard.score, 0) AS gamescore,
        COALESCE(playeringame.playerscore, 0) AS playerscore,
        COALESCE(playeringame.kills, 0) AS kills,
        COALESCE(playeringame.towers_placed, 0) AS towersPlaced,
        COALESCE(playeringame.coins_spent, 0) AS coinsSpent,
        COALESCE(playeringame.wave_reached, 0) AS waveReached,
        TO_CHAR(playeringame.game_time, 'HH24:MI:SS') AS time,
        TO_CHAR(playeringame.game_date, 'YYYY-MM-DD') AS date
      FROM 
        users
      JOIN 
        playeringame ON users.id = playeringame.userid
      LEFT JOIN 
        gameleaderboard ON playeringame.gameid = gameleaderboard.gameid
      WHERE 
        users.id = ${userid}
      ORDER BY 
        playeringame.playerscore DESC
      LIMIT 50;
    `;

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ username: "Unknown", games: [] });
    }

    const playerData = {
      username: result.rows[0].username,
      games: result.rows.map(row => ({
        gameid: row.gameid,
        gamescore: row.gamescore,
        playerscore: row.playerscore,
        kills: row.kills,
        towersPlaced: row.towersPlaced,
        coinsSpent: row.coinsSpent,
        waveReached: row.waveReached,
        time: row.time,
        date: row.date
      }))
    };

    return NextResponse.json(playerData);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: "Failed to fetch player leaderboard" }, { status: 500 });
  }
}
