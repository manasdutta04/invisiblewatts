import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import AnalyticsContent from "@/components/kokonutui/analytics-content"
import { cookies } from "next/headers"

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    return (
      <Layout>
        <AnalyticsContent
          co2Trend={[
            { date: "Jan 10", co2: 820 },
            { date: "Jan 24", co2: 1240 },
            { date: "Feb 8", co2: 680 },
            { date: "Feb 22", co2: 1100 },
          ]}
          deviceBreakdown={[
            { device: "Laptop", hours: 28.5 },
            { device: "Phone", hours: 11.0 },
            { device: "Tablet", hours: 3.0 },
          ]}
          activityBreakdown={[
            { activity: "Browsing", hours: 18.0 },
            { activity: "Streaming", hours: 12.5 },
            { activity: "Gaming", hours: 7.0 },
            { activity: "Calls", hours: 3.5 },
            { activity: "Mixed", hours: 1.5 },
          ]}
          totalCo2={3840}
          totalHours={42.5}
          uniqueDays={14}
          isDemoMode
        />
      </Layout>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: analyses }, { data: entries }] = await Promise.all([
    supabase
      .from("ai_analysis")
      .select("co2_estimate_grams, created_at")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: true }),
    supabase
      .from("usage_entries")
      .select("device_type, daily_hours, activity_type, date")
      .eq("user_id", user?.id ?? ""),
  ])

  const co2Trend = (analyses ?? []).map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    co2: Math.round(a.co2_estimate_grams ?? 0),
  }))

  const deviceMap: Record<string, number> = {}
  const activityMap: Record<string, number> = {}
  for (const e of entries ?? []) {
    deviceMap[e.device_type] = (deviceMap[e.device_type] ?? 0) + Number(e.daily_hours)
    activityMap[e.activity_type] = (activityMap[e.activity_type] ?? 0) + Number(e.daily_hours)
  }

  const deviceBreakdown = Object.entries(deviceMap).map(([device, hours]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    hours: Math.round(hours * 10) / 10,
  }))
  const activityBreakdown = Object.entries(activityMap).map(([activity, hours]) => ({
    activity: activity.charAt(0).toUpperCase() + activity.slice(1),
    hours: Math.round(hours * 10) / 10,
  }))

  const totalCo2 = (analyses ?? []).reduce((s, a) => s + (a.co2_estimate_grams ?? 0), 0)
  const totalHours = (entries ?? []).reduce((s, e) => s + Number(e.daily_hours), 0)
  const uniqueDays = new Set((entries ?? []).map((e) => e.date)).size

  return (
    <Layout>
      <AnalyticsContent
        co2Trend={co2Trend}
        deviceBreakdown={deviceBreakdown}
        activityBreakdown={activityBreakdown}
        totalCo2={totalCo2}
        totalHours={totalHours}
        uniqueDays={uniqueDays}
      />
    </Layout>
  )
}
