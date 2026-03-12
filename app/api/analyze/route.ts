import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { UsageEntryInput } from "@/lib/supabase/types"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// CO₂ factors per hour (grams)
const CO2_BASE: Record<string, number> = { phone: 0.4, laptop: 10, tablet: 3 }
const ACTIVITY_MULT: Record<string, number> = {
  streaming: 3,
  gaming: 2,
  social: 2,
  calls: 1.5,
  browsing: 1,
  productivity: 0.7,
  mixed: 1.2,
}

async function callGroq(body: object): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0]?.message?.content ?? "{}"
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { mode } = body

  // ─── IMAGE MODE: extract entries from screenshot ──────────────────────────
  if (mode === "image") {
    const { imageBase64, mimeType } = body as {
      imageBase64: string
      mimeType: string
    }

    const raw = await callGroq({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `You are an AI that extracts digital device usage data from screenshots. You handle ALL of these formats:

SUPPORTED FORMATS:
1. iOS Screen Time — shows daily/weekly totals per app or by category
2. Android Digital Wellbeing — shows app usage bars and hours/minutes
3. Windows Screen Time / Digital Wellbeing
4. Windows Power & Battery (Settings > System > Power & battery > Battery usage)
5. macOS Screen Time
6. Any other app usage, battery usage, or screen time report

IOS / MACOS SCREEN TIME — CATEGORY VIEW RULES:
When you see a breakdown by category (Social, Entertainment, Other, Productivity, Games, etc.) — this includes "All Devices" or single device views:
- Create ONE ENTRY PER CATEGORY that has a visible time value
- Map each category to activity_type:
  * Social, TikTok, Instagram, Twitter/X, Facebook, Reddit → "social"
  * Entertainment, YouTube, Netflix, Spotify, music/video → "streaming"
  * Games → "gaming"
  * Communication, Phone, WhatsApp, Messages, FaceTime → "calls"
  * Productivity, Finance, Creativity, Documents, Email, Calendar → "productivity"
  * Information & Reading, News, Education, Travel, Safari, Browser → "browsing"
  * Other, Health, Fitness → "mixed"
- daily_hours = the category's time value converted to hours (e.g. 2h 12m → 2.2, 45m → 0.8)
- Skip any category with less than 5 minutes of usage (e.g. "57s", "10s" → skip)
- All entries share the same date and device_type

IOS / MACOS SCREEN TIME — SINGLE TOTAL VIEW RULES:
When you see a single total (e.g. "9h 33m" for the whole day):
- Create ONE entry with that total as daily_hours
- Infer activity_type from app names visible (Social/Safari → browsing, etc.)

WINDOWS POWER & BATTERY RULES:
- Device type = "laptop"
- Sum ALL "In use (Xmin)" values across every visible app to get total active minutes
- Convert total minutes to hours (e.g. 45 min → 0.8h, 90 min → 1.5h)
- If total is under 30 minutes, still output at least 0.5 daily_hours
- Determine activity_type from which apps dominate

GENERAL RULES:
- TODAY is ${new Date().toISOString().slice(0, 10)} — use this EXACT date if no date is shown, or if the screenshot shows a day/month without a year (DO NOT use 2024 or any past year)
- If a date is shown with day + month only (e.g. "12 March"), use the current year: ${new Date().getFullYear()}
- Infer device: iOS/Android UI → "phone", Windows/macOS settings → "laptop", iPad → "tablet"
- ALWAYS return at least one entry if ANY usage data is visible
- daily_hours minimum is 0.5 per entry

Return ONLY this JSON (no markdown, no explanation):
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "device_type": "phone" | "laptop" | "tablet",
      "daily_hours": <number, 1 decimal, min 0.5>,
      "activity_type": "streaming" | "browsing" | "gaming" | "calls" | "social" | "productivity" | "mixed"
    }
  ]
}`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    })

    // Strip markdown code fences the model sometimes adds
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim()

    try {
      const parsed = JSON.parse(cleaned) as { entries: UsageEntryInput[] }
      return NextResponse.json({ entries: parsed.entries ?? [] })
    } catch {
      return NextResponse.json({ entries: [] })
    }
  }

  // ─── ANALYZE MODE: analyze entries, save to DB ────────────────────────────
  if (mode === "analyze") {
    const { entries } = body as { entries: UsageEntryInput[] }

    if (!entries?.length) {
      return NextResponse.json({ error: "No entries provided" }, { status: 400 })
    }

    // Calculate a rough client-side CO₂ estimate as a sanity check for the prompt
    const roughCo2 = entries.reduce((sum, e) => {
      const base = CO2_BASE[e.device_type] ?? 5
      const mult = ACTIVITY_MULT[e.activity_type] ?? 1
      return sum + base * mult * e.daily_hours
    }, 0)

    const entriesSummary = entries
      .map(
        (e) =>
          `${e.date} | ${e.device_type} | ${e.daily_hours}h | ${e.activity_type}`
      )
      .join("\n")

    const raw = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an environmental impact analyst specializing in digital carbon footprints. Use these CO₂ emission factors:
- Phone: 0.4 gCO₂/hour (avg 0.5W device + 0.1W network)
- Laptop: 10 gCO₂/hour (~25W avg + network)
- Tablet: 3 gCO₂/hour (~5W avg + network)
Activity multipliers (server-side emissions): streaming×3, gaming×2, social×2, calls×1.5, mixed×1.2, browsing×1, productivity×0.7
Respond ONLY with valid JSON, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze this digital device usage data and calculate environmental impact:

DATE | DEVICE | HOURS | ACTIVITY
${entriesSummary}

Total entries: ${entries.length}
Rough CO₂ estimate: ${roughCo2.toFixed(0)}g

Return this exact JSON:
{
  "summary": "<2-3 sentences: total usage pattern, CO₂ produced, and how it compares to daily averages>",
  "co2_estimate_grams": <precise number>,
  "recommendations": [
    "<specific actionable tip to reduce digital carbon 1>",
    "<tip 2>",
    "<tip 3>",
    "<tip 4>",
    "<tip 5>"
  ]
}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1024,
    })

    let analysis: {
      summary: string
      co2_estimate_grams: number
      recommendations: string[]
    }

    try {
      analysis = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Save to ai_analysis table
    const { data: saved, error } = await supabase
      .from("ai_analysis")
      .insert({
        user_id: user.id,
        summary: analysis.summary,
        co2_estimate_grams: analysis.co2_estimate_grams ?? roughCo2,
        recommendations: analysis.recommendations ?? [],
        entry_count: entries.length,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ analysis: saved })
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
}
