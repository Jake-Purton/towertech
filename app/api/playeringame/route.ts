import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const result = await sql`
      SELECT p.gameid, u.name AS player_name, p.kills, p.playerscore
      FROM playeringame p
      JOIN users u ON p.userid = u.id
      ORDER BY p.gameid, p.playerscore DESC;
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching player game data:", error);
    return NextResponse.json({ error: "Failed to fetch player game data" }, { status: 500 });
  }
}

