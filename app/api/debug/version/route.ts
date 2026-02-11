import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    version: "2026-02-11-v123",
    imageMaxLen: 200000,
    timestamp: new Date().toISOString()
  });
}
