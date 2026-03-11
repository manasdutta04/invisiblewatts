import Content from "./content"
import Layout from "./layout"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import {
  DEMO_HOURLY_DATA,
  DEMO_WEEKLY_DATA,
  DEMO_METRICS,
} from "@/lib/demo-data"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default async function Dashboard() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    return (
      <Layout>
        <Content
          hourlyData={DEMO_HOURLY_DATA}
          weeklyData={DEMO_WEEKLY_DATA}
          currentKw={DEMO_METRICS.currentKw}
          todayKwh={DEMO_METRICS.todayKwh}
          monthlyAvgKwh={DEMO_METRICS.monthlyAvgKwh}
          isDemoMode
        />
      </Layout>
    )
  }

  const supabase = await createClient()

  const [
    { data: hourlyRows },
    { data: dailyRows },
    { data: monthlyRows },
  ] = await Promise.all([
    supabase
      .from("hourly_readings")
      .select("hour_label, kw_usage, kw_target")
      .order("recorded_at", { ascending: true }),
    supabase
      .from("daily_readings")
      .select("date, kwh_total")
      .order("date", { ascending: true })
      .limit(7),
    supabase
      .from("monthly_readings")
      .select("kwh_total")
      .order("sort_order", { ascending: true }),
  ])

  const hourlyData = (hourlyRows ?? []).map((r) => ({
    hour_label: r.hour_label,
    kw_usage: Number(r.kw_usage),
    kw_target: Number(r.kw_target),
  }))

  const weeklyData = (dailyRows ?? []).map((r) => ({
    day: DAYS[new Date(r.date + "T12:00:00").getDay()],
    kWh: Number(r.kwh_total),
  }))

  const currentKw = hourlyData.at(-1)?.kw_usage ?? 0
  const todayKwh = Number(dailyRows?.at(-1)?.kwh_total ?? 0)
  const monthlyAvgKwh = monthlyRows?.length
    ? Math.round(
        monthlyRows.reduce((s, r) => s + Number(r.kwh_total), 0) /
          monthlyRows.length
      )
    : 0

  return (
    <Layout>
      <Content
        hourlyData={hourlyData}
        weeklyData={weeklyData}
        currentKw={currentKw}
        todayKwh={todayKwh}
        monthlyAvgKwh={monthlyAvgKwh}
      />
    </Layout>
  )
}
