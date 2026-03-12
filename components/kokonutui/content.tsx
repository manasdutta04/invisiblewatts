"use client"

import { Leaf, Clock, Database, Sparkles, FlaskConical, PlugZap, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Co2Session {
  date: string
  co2: number
}

interface DeviceHour {
  device: string
  hours: number
}

interface ContentProps {
  totalCo2: number
  totalHours: number
  totalEntries: number
  co2Sessions: Co2Session[]
  deviceHours: DeviceHour[]
  latestRecs: string[]
  latestSummary: string | null
  isDemoMode?: boolean
}

export default function Content({
  totalCo2,
  totalHours,
  totalEntries,
  co2Sessions,
  deviceHours,
  latestRecs,
  latestSummary,
  isDemoMode,
}: ContentProps) {
  const isEmpty = totalEntries === 0 && co2Sessions.length === 0
  const needsAnalysis = totalEntries > 0 && co2Sessions.length === 0
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function handleRunAnalysis() {
    setIsAnalyzing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: entries } = await supabase
        .from("usage_entries")
        .select("date, device_type, daily_hours, activity_type, notes")
        .eq("user_id", user?.id ?? "")
      if (!entries?.length) return
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "analyze", entries }),
      })
      if (res.ok) router.push("/ai-insights")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span>
            You&apos;re viewing <strong>demo data</strong>. Upload your device usage data on the{" "}
            <strong>Upload</strong> page to see your real footprint.
          </span>
        </div>
      )}

      {/* Needs-analysis nudge */}
      {!isDemoMode && needsAnalysis && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {totalEntries} {totalEntries === 1 ? "entry" : "entries"} saved — no CO₂ analysis yet
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
              Run an AI analysis to calculate your digital carbon footprint.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAnalyzing ? "Analysing…" : "Analyse Now"}
          </button>
        </div>
      )}

      {!isDemoMode && isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <PlugZap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No data yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Upload your screen time data on the <strong>Upload</strong> page, or enable{" "}
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
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<Leaf className="w-5 h-5" />}
              label="Total CO₂ Tracked"
              value={totalCo2 >= 1000 ? `${(totalCo2 / 1000).toFixed(2)} kg` : `${Math.round(totalCo2)} g`}
              sub="from all AI analyses"
              color="from-green-500 to-emerald-500"
            />
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              label="Total Hours Logged"
              value={`${totalHours.toFixed(1)} h`}
              sub="across all devices"
              color="from-blue-500 to-cyan-500"
            />
            <MetricCard
              icon={<Database className="w-5 h-5" />}
              label="Entries Logged"
              value={String(totalEntries)}
              sub="total usage records"
              color="from-violet-500 to-purple-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {co2Sessions.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  CO₂ per Analysis Session
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={co2Sessions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9ca3af" unit="g" />
                    <Tooltip formatter={(v) => [`${v} g`, "CO₂"]} />
                    <Bar dataKey="co2" fill="#10b981" radius={[6, 6, 0, 0]} name="CO₂ (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {deviceHours.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Hours by Device
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deviceHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="device" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" unit="h" />
                    <Tooltip formatter={(v) => [`${v} h`, "Hours"]} />
                    <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Latest AI recommendations */}
          {latestRecs.length > 0 && (
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Latest Recommendations
                </h2>
              </div>
              {latestSummary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-[#1F1F23]">
                  {latestSummary}
                </p>
              )}
              <ul className="space-y-2">
                {latestRecs.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({
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
