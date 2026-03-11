import Content from "./content"
import Layout from "./layout"
import { createClient } from "@/lib/supabase/server"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default async function Dashboard() {
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

  const currentKw = hourlyData.at(-1)?.kw_usage ?? 2.4
  const todayKwh = Number(dailyRows?.at(-1)?.kwh_total ?? 45.2)
  const monthlyAvgKwh = monthlyRows?.length
    ? Math.round(
        monthlyRows.reduce((s, r) => s + Number(r.kwh_total), 0) /
          monthlyRows.length
      )
    : 1245

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
