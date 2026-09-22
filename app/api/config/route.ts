import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { hostUrl: process.env.HOST_URL || null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
