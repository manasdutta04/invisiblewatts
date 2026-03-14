import { NextResponse } from "next/server"

export async function GET() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ ok: false, reason: "AI API key error" })
  }
  return NextResponse.json({ ok: true })
}
