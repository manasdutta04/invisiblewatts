import Content from "./content"
import Layout from "./layout"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function Dashboard() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    return (
      <Layout>
        <Content
          userName="there"
          totalCo2={3840}
          totalHours={42.5}
          totalEntries={28}
          analysesCount={4}
          todayEntryCount={3}
          co2Sessions={[
            { date: "Jan 10", co2: 820 },
            { date: "Jan 24", co2: 1240 },
            { date: "Feb 8", co2: 680 },
            { date: "Feb 22", co2: 1100 },
          ]}
          deviceHours={[
            { device: "Laptop", hours: 28.5 },
            { device: "Phone", hours: 11.0 },
            { device: "Tablet", hours: 3.0 },
          ]}
          latestRecs={[
            "Switch video streaming from 4K to HD to cut streaming CO₂ by up to 70%.",
            "Set your laptop to auto-sleep after 5 minutes of inactivity.",
            "Use dark mode on OLED screens — it reduces display energy by ~20%.",
          ]}
          latestSummary="Your digital activity produced approximately 3.8 kg CO₂. Laptop streaming accounts for the largest share."
          isDemoMode
        />
      </Layout>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: analyses }, { data: entries }, { data: profile }] = await Promise.all([
    supabase
      .from("ai_analysis")
      .select("id, co2_estimate_grams, entry_count, created_at, summary, recommendations")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: true })
      .limit(20),
    supabase
      .from("usage_entries")
      .select("date, device_type, daily_hours, activity_type, created_at")
      .eq("user_id", user?.id ?? ""),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user?.id ?? "")
      .single(),
  ])

  const userName = profile?.full_name ?? user?.email?.split("@")[0] ?? "there"

  const totalCo2 = (analyses ?? []).reduce((s, a) => s + (a.co2_estimate_grams ?? 0), 0)
  const totalHours = (entries ?? []).reduce((s, e) => s + Number(e.daily_hours), 0)
  const totalEntries = entries?.length ?? 0
  const analysesCount = analyses?.length ?? 0

  const co2Sessions = (analyses ?? []).map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    co2: Math.round(a.co2_estimate_grams ?? 0),
  }))

  const deviceMap: Record<string, number> = {}
  for (const e of entries ?? []) {
    deviceMap[e.device_type] = (deviceMap[e.device_type] ?? 0) + Number(e.daily_hours)
  }
  const deviceHours = Object.entries(deviceMap).map(([device, hours]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    hours: Math.round(hours * 10) / 10,
  }))

  const today = new Date().toISOString().slice(0, 10)
  const latestAnalysisAt = analyses?.at(-1)?.created_at ?? null
  const unanalyzedCount = latestAnalysisAt
    ? (entries ?? []).filter((e) => e.created_at > latestAnalysisAt).length
    : (entries?.length ?? 0)
  const hasNewEntries = unanalyzedCount > 0
  const todayEntryCount = (entries ?? []).filter((e) => e.date === today).length

  const latestRecs = (analyses?.at(-1)?.recommendations ?? []) as string[]
  const latestSummary = analyses?.at(-1)?.summary ?? null

  return (
    <Layout>
      <Content
        userName={userName}
        totalCo2={totalCo2}
        totalHours={totalHours}
        totalEntries={totalEntries}
        analysesCount={analysesCount}
        co2Sessions={co2Sessions}
        deviceHours={deviceHours}
        latestRecs={latestRecs}
        latestSummary={latestSummary}
        hasNewEntries={hasNewEntries}
        unanalyzedCount={unanalyzedCount}
        todayEntryCount={todayEntryCount}
      />
    </Layout>
  )
}
