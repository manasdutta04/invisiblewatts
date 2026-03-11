"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Home, Zap, FlaskConical, PlugZap } from "lucide-react"
import type { MonthlyReading, CategoryBreakdown } from "@/lib/supabase/types"

const CATEGORY_COLORS: Record<string, string> = {
  HVAC: "#0ea5e9",
  "Water Heating": "#f97316",
  Lighting: "#fbbf24",
  Appliances: "#06b6d4",
}

interface TimeBlock {
  period: string
  usage: number
}

export default function AnalyticsContent({
  monthlyData,
  categoryData,
  timeOfUseData,
  isDemoMode,
}: {
  monthlyData: MonthlyReading[]
  categoryData: CategoryBreakdown[]
  timeOfUseData: TimeBlock[]
  isDemoMode?: boolean
}) {
  const isEmpty = monthlyData.length === 0 && categoryData.length === 0

  const monthlyTrend = monthlyData.map((r) => ({
    month: r.month_label,
    usage: Number(r.kwh_total),
    cost: Number(r.cost_dollars),
  }))

  const pieData = categoryData.map((r) => ({
    name: r.category,
    value: Number(r.percentage),
    color: CATEGORY_COLORS[r.category] ?? "#8884d8",
  }))

  // Derived stat cards from real data
  const latestMonthly = monthlyData.at(-1)
  const avgDailyUsage =
    monthlyData.length > 0
      ? (
          monthlyData.reduce((s, r) => s + Number(r.kwh_total), 0) /
          monthlyData.length /
          30
        ).toFixed(1)
      : "—"
  const monthlyCost = latestMonthly
    ? `$${Number(latestMonthly.cost_dollars).toLocaleString()}`
    : "—"
  const peakUsage =
    timeOfUseData.length > 0
      ? (Math.max(...timeOfUseData.map((t) => t.usage)) / 6).toFixed(1)
      : "—"

  const trendArrow = (dir: string, pct: number) => {
    if (dir === "up") return `↑ ${pct}%`
    if (dir === "down") return `↓ ${pct}%`
    return `→ 0%`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Energy Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed analysis of your energy consumption patterns
        </p>
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span>
            You&apos;re viewing <strong>demo data</strong>. Upload your own device usage data to see your real analytics.
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isDemoMode && isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <PlugZap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No analytics yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Upload your usage data on the <strong>Upload</strong> page to see your analytics, or use <strong>Demo Mode</strong> in the sidebar to explore with sample data.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Average Daily Usage"
              value={`${avgDailyUsage} kWh`}
              subtext="Monthly average ÷ 30"
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Home className="w-5 h-5" />}
              label="Monthly Cost"
              value={monthlyCost}
              subtext="Latest month"
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="Peak Load"
              value={`${peakUsage} kW`}
              subtext="Avg during busiest block"
              color="from-red-500 to-pink-500"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Monthly Trend ({monthlyData.length} Months)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    fill="#0ea5e9"
                    stroke="#0ea5e9"
                    fillOpacity={0.3}
                    name="Usage (kWh)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Consumption Breakdown */}
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Consumption by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Time of Use */}
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Time of Use Pattern
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeOfUseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Usage (kW)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Category Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#1F1F23]">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Monthly (kWh)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">% of Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Cost</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((row) => (
                    <tr
                      key={row.category}
                      className="border-b border-gray-100 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{row.category}</td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{Number(row.kwh_total)}</td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{Number(row.percentage)}%</td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">${Number(row.cost_dollars)}</td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                        {trendArrow(row.trend_direction, Number(row.trend_percent))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtext}</div>
    </div>
  )
}
