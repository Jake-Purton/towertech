import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing environment variable: NEXT_PRIVATE_JWT_SECRET");
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token is valid");
      return NextResponse.json({ valid: true, decoded });
    } catch {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Token verification failed" }, { status: 500 });
  }
}