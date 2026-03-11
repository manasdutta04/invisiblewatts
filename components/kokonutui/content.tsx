"use client"

import { TrendingDown, Zap, AlertCircle, Lightbulb, Wind } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface HourlyPoint {
  hour_label: string
  kw_usage: number
  kw_target: number
}

interface WeeklyPoint {
  day: string
  kWh: number
}

interface ContentProps {
  hourlyData: HourlyPoint[]
  weeklyData: WeeklyPoint[]
  currentKw: number
  todayKwh: number
  monthlyAvgKwh: number
}

export default function Content({
  hourlyData,
  weeklyData,
  currentKw,
  todayKwh,
  monthlyAvgKwh,
}: ContentProps) {
  const chartHourly = hourlyData.map((r) => ({
    hour: r.hour_label,
    usage: r.kw_usage,
    target: r.kw_target,
  }))

  const chartWeekly = weeklyData.map((r) => ({
    day: r.day,
    kWh: r.kWh,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          label="Current Usage"
          value={`${currentKw.toFixed(1)} kW`}
          change="Live reading"
          color="from-blue-500 to-cyan-500"
        />
        <MetricCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Today's Total"
          value={`${todayKwh.toFixed(1)} kWh`}
          change="Cumulative today"
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={<Lightbulb className="w-5 h-5" />}
          label="Monthly Average"
          value={`${monthlyAvgKwh.toLocaleString()} kWh`}
          change="8-month average"
          color="from-amber-500 to-orange-500"
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Peak Hours"
          value="16:00 - 20:00"
          change="Next peak tonight"
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Today's Consumption
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartHourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                name="Usage (kW)"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                name="Target (kW)"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Weekly Usage
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="kWh" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightCard
          title="Peak Hours Alert"
          description="Your usage typically peaks between 4PM–8PM. Consider shifting loads to off-peak hours."
          icon={<Zap className="w-5 h-5" />}
        />
        <InsightCard
          title="Savings Opportunity"
          description="Upgrading to an energy-efficient HVAC system could save ~15% annually."
          icon={<Lightbulb className="w-5 h-5" />}
        />
        <InsightCard
          title="Weather Impact"
          description="Cooler temperatures tomorrow may reduce cooling costs by 8–12%."
          icon={<Wind className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  color: string
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div
        className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-3`}
      >
        {icon}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
        {change}
      </div>
    </div>
  )
}

function InsightCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#1F1F23] dark:to-[#0F0F12] rounded-xl p-4 border border-blue-200 dark:border-[#2B2B30]">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
