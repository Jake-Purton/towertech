import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing environment variable: NEXT_PRIVATE_JWT_SECRET");
}

export async function POST(req: Request) {
  try {
    const { token, gameData } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token is valid");

      // Insert game data into the database
      const result = await sql`INSERT INTO gameleaderboard (score) VALUES (${gameData.gamescore}) RETURNING gameid`;
      const gameid = result.rows[0].gameid;
      console.log(gameid);

      console.log(gameData.player_data);

      try {

        for (const player of gameData.player_data) {
          console.log(player);
          const playerResult = await sql`INSERT INTO playeringame (gameid, userid, kills, playerscore) VALUES (${gameid}, ${player.player_id}, ${player.kills}, ${player.score}) RETURNING *`;
          console.log(playerResult);
        }
      } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error inserting player data" }, { status: 500 });
      }


      console.log("✅ Game data inserted");

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
  }
}