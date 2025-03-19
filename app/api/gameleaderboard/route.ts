import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameid = searchParams.get("gameid");
  let difficulty = searchParams.get("difficulty");
  let map = searchParams.get("map") ? Number(searchParams.get("map")) : 0;

  if (difficulty) {
    console.log(difficulty)
  } else {
    difficulty = ' '
  }

  if (map) {
    console.log(map)
  } else {
    map = 0
  }

  try {
    let result;
    if (gameid) {
      result = await sql`
        SELECT 
          gameleaderboard.gameid,
          gameleaderboard.score,
          gameleaderboard.waves,
          playeringame.userid,
          playeringame.kills,
          playeringame.playerscore,
          playeringame.username,
          users.name
        FROM 
          gameleaderboard
        JOIN 
          playeringame ON gameleaderboard.gameid = playeringame.gameid
        JOIN 
          users ON playeringame.userid = users.id
        WHERE 
          gameleaderboard.gameid = ${gameid}
        ORDER BY 
          playeringame.playerscore DESC;
      `;
    } else {
      result = await sql`
        SELECT 
          gameleaderboard.gameid,
          gameleaderboard.score,
          gameleaderboard.waves,
          playeringame.userid,
          playeringame.kills,
          playeringame.playerscore,
          playeringame.username,
          users.name
        FROM 
          gameleaderboard
        JOIN 
          playeringame ON gameleaderboard.gameid = playeringame.gameid
        JOIN 
          users ON playeringame.userid = users.id
        WHERE
          (gameleaderboard.difficulty = ${difficulty} OR ${difficulty} = ' ')
        AND 
          (gameleaderboard.map = ${map} OR ${map} = 0)
        ORDER BY 
          gameleaderboard.score DESC;
      `;
    }

    const games = result.rows.reduce((acc, row) => {
      const gameIndex = acc.findIndex(game => game.gameid === row.gameid);
      const playerData = {
        userid: row.userid,
        name: row.name,
        kills: row.kills,
        playerscore: row.playerscore,
        username: row.username,
      };

      if (gameIndex === -1) {
        acc.push({
          gameid: row.gameid,
          score: row.score,
          waves: row.waves, // Include waves in the response
          players: [playerData]
        });
      } else {
        acc[gameIndex].players.push(playerData);
      }

      return acc;
    }, []);

    return NextResponse.json(gameid ? games[0] : games);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}