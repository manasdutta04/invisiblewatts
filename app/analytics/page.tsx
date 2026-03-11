import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import AnalyticsContent from "@/components/kokonutui/analytics-content"
import type { MonthlyReading, CategoryBreakdown } from "@/lib/supabase/types"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: monthlyRows },
    { data: categoryRows },
    { data: hourlyRows },
  ] = await Promise.all([
    supabase
      .from("monthly_readings")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("category_breakdown")
      .select("*")
      .order("percentage", { ascending: false }),
    supabase
      .from("hourly_readings")
      .select("hour_label, kw_usage")
      .order("recorded_at", { ascending: true }),
  ])

  // Aggregate hourly readings into 4 time blocks
  const blocks = [
    { period: "00:00–06:00", hours: ["00", "01", "02", "03", "04", "05"] },
    { period: "06:00–12:00", hours: ["06", "07", "08", "09", "10", "11"] },
    { period: "12:00–18:00", hours: ["12", "13", "14", "15", "16", "17"] },
    { period: "18:00–24:00", hours: ["18", "19", "20", "21", "22", "23"] },
  ]

  const timeOfUseData = blocks.map((block) => ({
    period: block.period,
    usage: Math.round(
      (hourlyRows ?? [])
        .filter((r) => block.hours.some((h) => r.hour_label.startsWith(h)))
        .reduce((sum, r) => sum + Number(r.kw_usage), 0)
    ),
  }))

  return (
    <Layout>
      <AnalyticsContent
        monthlyData={(monthlyRows ?? []) as MonthlyReading[]}
        categoryData={(categoryRows ?? []) as CategoryBreakdown[]}
        timeOfUseData={timeOfUseData}
      />
    </Layout>
  )
}
