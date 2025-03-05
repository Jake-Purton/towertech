import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
    console.log("🔍 Fetching records from table...");
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table");

    if (!tableName) {
        console.log("❌ Table name is required.");
        return NextResponse.json({ error: "Table name is required." }, { status: 400 });
    }

    // Basic validation to ensure the table name is alphanumeric
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        console.log("❌ Invalid table name.");
        return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
    }

    try {
        const query = `SELECT * FROM ${tableName};`;
        const result = await sql.query(query);
        const records = result.rows;
        console.log(`✅ Fetched ${records.length} records from table ${tableName}`);
        return NextResponse.json({ records });
    } catch (error) {
        console.log(`❌ Error fetching records from table ${tableName}:`, error);
        return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }
}