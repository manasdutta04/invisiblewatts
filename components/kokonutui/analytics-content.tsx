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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                CO₂ Trend by Analysis
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={co2Trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" unit="g" />
                  <Tooltip formatter={(v) => [`${v} g`, "CO₂"]} />
                  <Area
                    type="monotone"
                    dataKey="co2"
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.2}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Hours by Device
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deviceBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="device" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" unit="h" />
                    <Tooltip formatter={(v) => [`${v} h`, "Hours"]} />
                    <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activityBreakdown.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Hours by Activity
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={activityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="activity" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" unit="h" />
                    <Tooltip formatter={(v) => [`${v} h`, "Hours"]} />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
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
