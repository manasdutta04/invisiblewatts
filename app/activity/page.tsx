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

  const [{ data: analyses }, { data: recentEntries }] = await Promise.all([
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
  ])

  const events: TimelineEvent[] = []

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
    })
  }

  events.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())

  return (
    <Layout>
      <ActivityContent events={events} />
    </Layout>
  )
}
