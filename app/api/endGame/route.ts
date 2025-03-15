import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing environment variable: NEXT_PRIVATE_JWT_SECRET");
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // console.log("THIS IS HERE AND THE FOLLOWING IS DATA")
    // console.log(data)

    if (!data.roomToken) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(data.roomToken, JWT_SECRET);

      try {
        // Insert game data into the database
        const result = await sql`INSERT INTO gameleaderboard (score, waves) VALUES (${data.gameData.game_score}, ${data.gameData.waves_survived}) RETURNING gameid`;
        const gameid = result.rows[0].gameid;
        
        console.log("✅ Game data inserted");
        // console.log(data.gameData.player_data);
        
        try {
          
          for (const player of data.gameData.player_data) {
            // console.log(player);
            const playerResult = await sql`INSERT INTO playeringame (gameid, userid, kills, playerscore, playerid, username) VALUES (${gameid}, '0', ${player.kills}, ${player.score}, ${player.player_id}, ${player.username}) RETURNING *`;
            // console.log(playerResult);
          }
        } catch (error) {
          console.log(error);
          return NextResponse.json({ error: "Error inserting player data" }, { status: 500 });
        }
        
        
        
        return NextResponse.json({ success: true, gameid: gameid });

      } catch (error) {
        console.log(error)
        return NextResponse.json({ valid: false, error: "Error inserting game data" }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
  }
}