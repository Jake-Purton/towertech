import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    console.log("Trying to connect to the database...");

    // Testing database connections
    const result = await sql`SELECT 1+1 AS sum;`;
    
    console.log("The database connection was successful!", result);
    return new Response(JSON.stringify({ success: true, data: result }), { status: 200 });
  } catch (error) {
    console.error("Database connection failure:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

