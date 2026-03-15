import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import ActivityContent from "@/components/kokonutui/activity-content"
import type { TimelineEvent } from "@/components/kokonutui/activity-content"
import { cookies } from "next/headers"

export default async function ActivityPage() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    const demoEvents: TimelineEvent[] = [
      {
        id: "demo-p1",
        type: "processing",
        title: "Processing Usage Data",
        detail: "Analyzing 3 entries from your devices",
        tag: "In Progress",
        occurred_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        device_type: "laptop",
        event_date: new Date().toISOString().split("T")[0],
      },
      {
        id: "demo-a3",
        type: "analysis",
        title: "AI Analysis Complete",
        detail: "Digital activity over 7 days produced approximately 1.1 kg CO₂. Laptop streaming is the primary contributor.",
        tag: "1100 g CO₂",
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "demo-u4",
        type: "upload",
        title: "Usage Data Logged",
        detail: "7 entries for the past week",
        tag: "laptop, phone",
        occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        device_type: "phone",
        event_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        id: "demo-fail1",
        type: "failed_upload",
        title: "Upload Failed",
        detail: "File validation error while processing",
        tag: "Failed",
        occurred_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        device_type: "tablet",
        event_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        error_message: "Invalid file format. Please upload a PNG or JPG screenshot.",
      },
      {
        id: "demo-a2",
        type: "analysis",
        title: "AI Analysis Complete",
        detail: "Your browsing and gaming sessions this week generated 680 g CO₂, below your weekly average.",
        tag: "680 g CO₂",
        occurred_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "demo-u2",
        type: "upload",
        title: "Usage Data Logged",
        detail: "5 entries across 3 devices",
        tag: "laptop, phone, tablet",
        occurred_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        device_type: "laptop",
        event_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        id: "demo-fail2",
        type: "failed_process",
        title: "Processing Failed",
        detail: "AI analysis encountered an error",
        tag: "Error",
        occurred_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        device_type: "phone",
        event_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        error_message: "Server timeout. Please try again later.",
      },
      {
        id: "demo-a1",
        type: "analysis",
        title: "AI Analysis Complete",
        detail: "High streaming usage this month contributed 1240 g CO₂. Consider reducing 4K video sessions.",
        tag: "1240 g CO₂",
        occurred_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "demo-u1",
        type: "upload",
        title: "Usage Data Logged",
        detail: "8 entries for the past week",
        tag: "laptop, phone",
        occurred_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        device_type: "phone",
        event_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
    ]
    return (
      <Layout>
        <ActivityContent events={demoEvents} isDemoMode />
      </Layout>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: analyses }, { data: recentEntries }, { data: uploadEvents }] = await Promise.all([
    supabase
      .from("ai_analysis")
      .select("id, co2_estimate_grams, entry_count, created_at, summary")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("usage_entries")
      .select("id, date, device_type, daily_hours, activity_type, created_at")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("upload_events")
      .select("id, created_at, status, event_date, device_type, entry_count, error_message")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const events: TimelineEvent[] = []

  // Add upload events
  for (const ue of uploadEvents ?? []) {
    if (ue.status === "processing") {
      events.push({
        id: `processing-${ue.id}`,
        type: "processing",
        title: "Processing Usage Data",
        detail: ue.entry_count ? `Analyzing ${ue.entry_count} entries` : "Analyzing entries",
        tag: "In Progress",
        occurred_at: ue.created_at,
        device_type: ue.device_type,
        event_date: ue.event_date,
      })
    } else if (ue.status === "failed") {
      const isProcessingFailure = ue.error_message?.toLowerCase().includes("analysis") ||
                                   ue.error_message?.toLowerCase().includes("ai")
      events.push({
        id: `failed-${ue.id}`,
        type: isProcessingFailure ? "failed_process" : "failed_upload",
        title: isProcessingFailure ? "Processing Failed" : "Upload Failed",
        detail: isProcessingFailure
          ? "AI analysis encountered an error"
          : "File validation error while processing",
        tag: "Failed",
        occurred_at: ue.created_at,
        device_type: ue.device_type,
        event_date: ue.event_date,
        error_message: ue.error_message,
      })
    }
  }

  // Add analysis events
  for (const a of analyses ?? []) {
    events.push({
      id: `analysis-${a.id}`,
      type: "analysis",
      title: "AI Analysis Complete",
      detail: a.summary ?? `${a.entry_count} entries analysed`,
      tag: `${Math.round(a.co2_estimate_grams ?? 0)} g CO₂`,
      occurred_at: a.created_at,
    })
  }

  // Group entries by date
  const entryByDate: Record<string, { count: number; devices: Set<string>; occurred_at: string }> = {}
  for (const e of recentEntries ?? []) {
    if (!entryByDate[e.date]) {
      entryByDate[e.date] = { count: 0, devices: new Set(), occurred_at: e.created_at }
    }
    entryByDate[e.date].count++
    entryByDate[e.date].devices.add(e.device_type)
  }

  for (const [date, info] of Object.entries(entryByDate)) {
    events.push({
      id: `upload-${date}`,
      type: "upload",
      title: "Usage Data Logged",
      detail: `${info.count} ${info.count === 1 ? "entry" : "entries"} for ${date}`,
      tag: Array.from(info.devices).join(", "),
      occurred_at: info.occurred_at,
      device_type: Array.from(info.devices)[0],
      event_date: date,
    })
  }

  events.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())

  return (
    <Layout>
      <ActivityContent events={events} />
    </Layout>
  )
}
