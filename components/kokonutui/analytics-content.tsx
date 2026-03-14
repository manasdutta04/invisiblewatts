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
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Leaf, Clock, CalendarDays, FlaskConical, PlugZap } from "lucide-react"
import Link from "next/link"

interface Co2Point {
  date: string
  co2: number
}

interface BreakdownItem {
  device?: string
  activity?: string
  hours: number
}

const DEVICE_COLORS: Record<string, string> = {
  phone: "#f59e0b",
  laptop: "#3b82f6",
  tablet: "#8b5cf6",
}

const ACTIVITY_COLORS: Record<string, string> = {
  streaming: "#ef4444",
  gaming: "#f97316",
  social: "#ec4899",
  browsing: "#3b82f6",
  calls: "#10b981",
  productivity: "#8b5cf6",
  mixed: "#6b7280",
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number; fill?: string; name?: string }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null
  const color = payload[0].fill && !payload[0].fill.startsWith("url") ? payload[0].fill : "#10b981"
  return (
    <div style={{
      background: "rgba(15,15,18,0.97)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      minWidth: "110px",
    }}>
      {label && <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "5px" }}>{label}</p>}
      <p style={{ color, fontSize: "15px", fontWeight: 700, margin: 0 }}>
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

export default function AnalyticsContent({
  co2Trend,
  deviceBreakdown,
  activityBreakdown,
  totalCo2,
  totalHours,
  uniqueDays,
  isDemoMode,
}: {
  co2Trend: Co2Point[]
  deviceBreakdown: BreakdownItem[]
  activityBreakdown: BreakdownItem[]
  totalCo2: number
  totalHours: number
  uniqueDays: number
  isDemoMode?: boolean
}) {
  const isEmpty = co2Trend.length === 0 && deviceBreakdown.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Breakdown of your digital carbon footprint
        </p>
      </div>

      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span>
            You&apos;re viewing <strong>demo data</strong>. Upload your own device usage data to see your real analytics.
          </span>
        </div>
      )}

      {!isDemoMode && isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <PlugZap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No analytics yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Upload your usage data on the <strong>Upload</strong> page, or use{" "}
              <strong>Demo Mode</strong> in the sidebar to explore with sample data.
            </p>
          </div>
          <Link
            href="/upload"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all"
          >
            Upload Data
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<Leaf className="w-5 h-5" />}
              label="Total CO₂"
              value={totalCo2 >= 1000 ? `${(totalCo2 / 1000).toFixed(2)} kg` : `${Math.round(totalCo2)} g`}
              sub="from all analyses"
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Total Screen Time"
              value={`${totalHours.toFixed(1)} h`}
              sub="hours logged"
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<CalendarDays className="w-5 h-5" />}
              label="Days Tracked"
              value={String(uniqueDays)}
              sub="unique days with data"
              color="from-violet-500 to-purple-500"
            />
          </div>

          {/* CO₂ Trend */}
          {co2Trend.length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                CO₂ Trend by Analysis
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Estimated grams of CO₂ per session over time</p>
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={co2Trend}>
                  <defs>
                    <linearGradient id="co2Area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.15)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="g" tick={{ fontSize: 11 }} width={44} />
                  <Tooltip content={<ChartTooltip unit="g CO₂" />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area
                    type="monotone"
                    dataKey="co2"
                    fill="url(#co2Area)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    dot={{ r: 4, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                    name="CO₂ (g)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Device and Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deviceBreakdown.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Hours by Device
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Total hours per device type</p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={deviceBreakdown} barSize={50}>
                    <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis dataKey="device" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="h" tick={{ fontSize: 11 }} width={36} />
                    <Tooltip content={<ChartTooltip unit="h" />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                    <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                      {deviceBreakdown.map((entry) => (
                        <Cell key={entry.device} fill={DEVICE_COLORS[entry.device ?? ""] ?? "#6b7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activityBreakdown.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Hours by Activity
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Screen time breakdown by activity type</p>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={activityBreakdown} barSize={32}>
                    <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis dataKey="activity" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="h" tick={{ fontSize: 11 }} width={36} />
                    <Tooltip content={<ChartTooltip unit="h" />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                    <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                      {activityBreakdown.map((entry) => (
                        <Cell key={entry.activity} fill={ACTIVITY_COLORS[entry.activity ?? ""] ?? "#6b7280"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{sub}</div>
    </div>
  )
}
