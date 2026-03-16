import Content from "./content"
import Layout from "./layout"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Data consumption rate per activity type (GB/hr)
const DATA_GB_PER_HOUR: Record<string, number> = {
  streaming: 3.0,
  gaming: 0.1,
  social: 0.5,
  calls: 1.0,
  browsing: 0.1,
  productivity: 0.05,
  mixed: 0.5,
}

// Conversion constants
const KWH_PER_GB = 0.06          // 1 GB ≈ 0.06 kWh
const GRID_G_PER_KWH = 475       // India grid: 475 g CO₂/kWh
const INR_PER_KWH = 7



export default async function Dashboard() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    // Demo: 42.5 hours, mix of streaming/social/browsing
    // Streaming: 28.5h × 3.0 GB/hr = 85.5 GB
    // Social:    11.0h × 0.5 GB/hr = 5.5 GB
    // Browsing:   3.0h × 0.1 GB/hr = 0.3 GB  → total ~91.3 GB
    const demoDataGB     = Math.round(91.3 * 100) / 100
    const demoEnergyKwh  = Math.round(demoDataGB * KWH_PER_GB * 100) / 100
    const demoDataCo2    = Math.round(demoEnergyKwh * GRID_G_PER_KWH)
    return (
      <Layout>
        <Content
          userName="there"
          totalCo2={3840}
          totalCostRupees={Math.round((3840 / GRID_G_PER_KWH) * INR_PER_KWH * 100) / 100}
          totalHours={42.5}
          totalEntries={28}
          analysesCount={4}
          todayEntryCount={3}
          totalDataGB={demoDataGB}
          totalEnergyKwh={demoEnergyKwh}
          dataBasedCo2={demoDataCo2}
          co2Sessions={[
            { date: "Jan 10", co2: 820 },
            { date: "Jan 24", co2: 1240 },
            { date: "Feb 8", co2: 680 },
            { date: "Feb 22", co2: 1100 },
          ]}
          dailyCo2={[
            { day: "Mon", co2: 45 },
            { day: "Tue", co2: 120 },
            { day: "Wed", co2: 89 },
            { day: "Thu", co2: 230 },
            { day: "Fri", co2: 165 },
            { day: "Sat", co2: 312 },
            { day: "Sun", co2: 116 },
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
          todayEntries={[
            { label: "Laptop·Streaming", hours: 2.5, co2: Math.round(2.5 * 3.0 * KWH_PER_GB * GRID_G_PER_KWH), device: "laptop" },
            { label: "Phone·Social",     hours: 1.5, co2: Math.round(1.5 * 0.5 * KWH_PER_GB * GRID_G_PER_KWH), device: "phone"  },
            { label: "Laptop·Browsing",  hours: 4.0, co2: Math.round(4.0 * 0.1 * KWH_PER_GB * GRID_G_PER_KWH), device: "laptop" },
          ]}
        />
      </Layout>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
  const totalCostRupees = Math.round((totalCo2 / GRID_G_PER_KWH) * INR_PER_KWH * 100) / 100
  const totalHours = (entries ?? []).reduce((s, e) => s + Number(e.daily_hours), 0)
  const totalEntries = entries?.length ?? 0
  const analysesCount = analyses?.length ?? 0

  // Data-pipeline metrics (from entries, deterministic)
  const totalDataGB   = Math.round(
    (entries ?? []).reduce((s, e) => s + (DATA_GB_PER_HOUR[e.activity_type] ?? 0.1) * Number(e.daily_hours), 0) * 100
  ) / 100
  const totalEnergyKwh = Math.round(totalDataGB * KWH_PER_GB * 100) / 100
  const dataBasedCo2  = Math.round(totalEnergyKwh * GRID_G_PER_KWH)

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

  // Daily CO₂ for last 7 days (computed from usage_entries)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const dailyMap: Record<string, number> = {}
  for (const e of entries ?? []) {
    const gbPerHr = DATA_GB_PER_HOUR[e.activity_type] ?? 0.1
    const co2 = gbPerHr * Number(e.daily_hours) * KWH_PER_GB * GRID_G_PER_KWH
    dailyMap[e.date] = (dailyMap[e.date] ?? 0) + co2
  }
  const dailyCo2 = last7.map((date) => ({
    day: new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
    co2: Math.round(dailyMap[date] ?? 0),
  }))

  const today = new Date().toISOString().slice(0, 10)
  const latestAnalysisAt = analyses?.at(-1)?.created_at ?? null
  const unanalyzedCount = latestAnalysisAt
    ? (entries ?? []).filter((e) => e.created_at > latestAnalysisAt).length
    : (entries?.length ?? 0)
  const hasNewEntries = unanalyzedCount > 0
  const todayEntryCount = (entries ?? []).filter((e) => e.date === today).length

  const todayEntries = (entries ?? [])
    .filter((e) => e.date === today)
    .map((e) => {
      const gbPerHr = DATA_GB_PER_HOUR[e.activity_type] ?? 0.1
      const co2 = Math.round(gbPerHr * Number(e.daily_hours) * KWH_PER_GB * GRID_G_PER_KWH)
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      return {
        label: `${cap(e.device_type)}·${cap(e.activity_type)}`,
        hours: Number(e.daily_hours),
        co2,
        device: e.device_type,
      }
    })

  const latestRecs = (analyses?.at(-1)?.recommendations ?? []) as string[]
  const latestSummary = analyses?.at(-1)?.summary ?? null

  return (
    <Layout>
      <Content
        userName={userName}
        totalCo2={totalCo2}
        totalCostRupees={totalCostRupees}
        totalHours={totalHours}
        totalEntries={totalEntries}
        analysesCount={analysesCount}
        totalDataGB={totalDataGB}
        totalEnergyKwh={totalEnergyKwh}
        dataBasedCo2={dataBasedCo2}
        co2Sessions={co2Sessions}
        dailyCo2={dailyCo2}
        deviceHours={deviceHours}
        latestRecs={latestRecs}
        latestSummary={latestSummary}
        hasNewEntries={hasNewEntries}
        unanalyzedCount={unanalyzedCount}
        todayEntryCount={todayEntryCount}
        todayEntries={todayEntries}
      />
    </Layout>
  )
}
