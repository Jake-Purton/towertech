import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameid = searchParams.get("gameid");
  const playerid = searchParams.get("playerid");

  if (!playerid) {
    return NextResponse.json({ error: "Missing playerid parameter" }, { status: 400 });
  }
  if (!gameid) {
    return NextResponse.json({ error: "Missing userid parameter" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT playerscore, kills, username
      FROM playeringame
      WHERE gameid = ${gameid} AND playerid = ${playerid}
    `;

    const row = result.rows[0]

    const data  = {
        playerscore: row.playerscore,
        kills: row.kills,
        username: row.username,
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching player data:", error);
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}
