import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const players = await sql`SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10`;
    return new Response(JSON.stringify({ players }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }
}
