import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { UsageEntryInput } from "@/lib/supabase/types"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// CO₂ factors per hour (grams)
const CO2_BASE: Record<string, number> = { phone: 0.4, laptop: 10, tablet: 3 }
const ACTIVITY_MULT: Record<string, number> = {
  streaming: 3,
  gaming: 2,
  calls: 1.5,
  browsing: 1,
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
      model: "llama-3.2-11b-vision-preview",
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
              text: `You are analyzing a screenshot of a device screen time or digital wellbeing report. Extract all usage data visible.

Return ONLY a JSON object (no markdown, no explanation):
{
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "device_type": "phone" | "laptop" | "tablet",
      "daily_hours": <number with 1 decimal>,
      "activity_type": "streaming" | "browsing" | "gaming" | "calls" | "mixed"
    }
  ]
}

Rules:
- Use today's date (${new Date().toISOString().slice(0, 10)}) if no date is visible
- Infer device type from context or UI style (iOS/Android → phone, Windows/Mac → laptop)
- Map app categories: video/Netflix/YouTube → streaming, social/browser/news → browsing, games → gaming, phone/WhatsApp/Facetime → calls, everything else → mixed
- If multiple days shown, one entry per day
- daily_hours should reflect total screen on time`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    })

    try {
      const parsed = JSON.parse(raw) as { entries: UsageEntryInput[] }
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
Activity multipliers (server-side emissions): streaming×3, gaming×2, calls×1.5, browsing×1, mixed×1.2
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
