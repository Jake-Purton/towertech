import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
    try {
        const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;`;
        const tables = result.rows;
        return NextResponse.json({ tables });
    } catch (error) {
        console.error("❌ Error fetching tables:", error);
        return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }
}
