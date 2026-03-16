import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      date,          // YYYY-MM-DD
      device_type,   // 'laptop', 'phone', etc.
      activity_type, // 'streaming', 'gaming', etc.
      daily_hours,   // number
    } = body

    if (!date || !device_type || !activity_type || typeof daily_hours !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert into Supabase typical structure: date, device_type, daily_hours, activity_type, user_id
    const { error: insertError } = await supabase
      .from("usage_entries")
      .insert({
        user_id: user.id,
        date,
        device_type,
        activity_type,
        daily_hours,
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to save entry" }, { status: 500 })
    }

    // Bust the dashboard cache so the server component re-fetches the new entry and computes new metrics
    revalidatePath("/dashboard")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
