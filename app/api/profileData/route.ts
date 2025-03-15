import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing environment variable: NEXT_PRIVATE_JWT_SECRET");
}

export async function POST(request: Request) {
  try {
    const { token, username } = await request.json();

    if (!token || !username) {
      return NextResponse.json({ error: "Token and username are required" }, { status: 400 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await sql`UPDATE users SET name = ${username} WHERE email = ${email}`;

    return NextResponse.json({ message: "Username updated successfully" });
  } catch (error) {
    console.error("Error in profileData API:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
