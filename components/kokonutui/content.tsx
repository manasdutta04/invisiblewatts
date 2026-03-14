"use client"

import { Clock, Sparkles, FlaskConical, PlugZap, Loader2, Zap, BarChart2, Monitor } from "lucide-react"
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
  Cell,
  ReferenceLine,
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
  userName: string
  totalCo2: number
  totalHours: number
  totalEntries: number
  analysesCount: number
  todayEntryCount: number
  co2Sessions: Co2Session[]
  deviceHours: DeviceHour[]
  latestRecs: string[]
  latestSummary: string | null
  isDemoMode?: boolean
  hasNewEntries?: boolean
  unanalyzedCount?: number
}

const DEVICE_COLORS: Record<string, string> = {
  phone: "#f59e0b",
  laptop: "#3b82f6",
  tablet: "#8b5cf6",
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number; fill?: string }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null
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
      <p style={{ color: payload[0].fill && payload[0].fill !== "url(#co2Bar)" ? payload[0].fill : "#818cf8", fontSize: "15px", fontWeight: 700, margin: 0 }}>
        {payload[0].value} {unit}
      </p>
    </div>
  )
}

export default function Content({
  userName,
  totalCo2,
  totalHours,
  totalEntries,
  analysesCount,
  todayEntryCount,
  co2Sessions,
  deviceHours,
  latestRecs,
  latestSummary,
  isDemoMode,
  hasNewEntries,
  unanalyzedCount,
}: ContentProps) {
  const isEmpty = totalEntries === 0 && co2Sessions.length === 0
  const needsAnalysis = !isDemoMode && ((totalEntries > 0 && co2Sessions.length === 0) || !!hasNewEntries)
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

  // Derived metric values
  const latestCo2 = co2Sessions.at(-1)?.co2 ?? 0
  const prevCo2 = co2Sessions.at(-2)?.co2 ?? null
  const co2TrendPct = prevCo2 ? Math.round((latestCo2 - prevCo2) / prevCo2 * 100) : null
  const avgCo2 = analysesCount > 0 ? Math.round(totalCo2 / analysesCount) : 0
  const topDevice = deviceHours.slice().sort((a, b) => b.hours - a.hours)[0] ?? null

  const fmtCo2 = (g: number) => g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`

  const avgHours = deviceHours.length
    ? parseFloat((deviceHours.reduce((s, d) => s + d.hours, 0) / deviceHours.length).toFixed(1))
    : 0

  const greeting = getGreeting()
  const firstName = userName.split(" ")[0]

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {firstName} 🌱
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isDemoMode
            ? "You're viewing demo data. Upload your screen time to see your real footprint."
            : "Here's your digital carbon footprint overview."}
        </p>
      </div>

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
      {needsAnalysis && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {hasNewEntries && co2Sessions.length > 0
                ? `${unanalyzedCount} new ${unanalyzedCount === 1 ? "entry" : "entries"} not yet analysed`
                : `${totalEntries} ${totalEntries === 1 ? "entry" : "entries"} saved — no CO₂ analysis yet`}
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
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Zap className="w-4 h-4" />}
              label="Latest CO₂"
              value={co2Sessions.length ? fmtCo2(latestCo2) : "—"}
              sub={
                co2TrendPct !== null
                  ? `${co2TrendPct > 0 ? "+" : ""}${co2TrendPct}% vs prev session`
                  : co2Sessions.length ? "first analysis" : "no analyses yet"
              }
              subColor={co2TrendPct === null ? "neutral" : co2TrendPct <= 0 ? "good" : "bad"}
            />
            <MetricCard
              icon={<Clock className="w-4 h-4" />}
              label="Today's Entries"
              value={String(todayEntryCount)}
              sub={todayEntryCount === 0 ? "none uploaded today" : `${todayEntryCount === 1 ? "entry" : "entries"} uploaded today`}
              subColor="neutral"
            />
            <MetricCard
              icon={<BarChart2 className="w-4 h-4" />}
              label="Avg CO₂ / Session"
              value={analysesCount ? fmtCo2(avgCo2) : "—"}
              sub={analysesCount ? `across ${analysesCount} ${analysesCount === 1 ? "analysis" : "analyses"}` : "no analyses yet"}
              subColor="neutral"
            />
            <MetricCard
              icon={<Monitor className="w-4 h-4" />}
              label="Top Device"
              value={topDevice ? topDevice.device : "—"}
              sub={topDevice ? `${topDevice.hours}h logged total` : "no entries yet"}
              subColor="neutral"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {co2Sessions.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  CO₂ per Analysis Session
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Grams of CO₂ estimated per run</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={co2Sessions} barSize={36}>
                    <defs>
                      <linearGradient id="co2Bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.65} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="g" tick={{ fontSize: 11 }} width={40} />
                    <Tooltip content={<ChartTooltip unit="g CO₂" />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                    {co2Sessions.length > 1 && (
                      <ReferenceLine
                        y={avgCo2}
                        stroke="#a5b4fc"
                        strokeDasharray="5 3"
                        strokeWidth={1.5}
                        label={{ value: `avg ${avgCo2}g`, position: "insideTopRight", fill: "#a5b4fc", fontSize: 10, dy: -8 }}
                      />
                    )}
                    <Bar dataKey="co2" fill="url(#co2Bar)" radius={[8, 8, 0, 0]} name="CO₂ (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {deviceHours.length > 0 && (
              <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  Hours by Device
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Total logged hours per device type</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deviceHours} barSize={48}>
                    <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.15)" />
                    <XAxis dataKey="device" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="h" tick={{ fontSize: 11 }} width={36} />
                    <Tooltip content={<ChartTooltip unit="h" />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                    {deviceHours.length > 1 && (
                      <ReferenceLine
                        y={avgHours}
                        stroke="#fcd34d"
                        strokeDasharray="5 3"
                        strokeWidth={1.5}
                        label={{ value: `avg ${avgHours}h`, position: "insideTopRight", fill: "#fcd34d", fontSize: 10, dy: -8 }}
                      />
                    )}
                    <Bar dataKey="hours" radius={[8, 8, 0, 0]} name="Hours">
                      {deviceHours.map((entry) => (
                        <Cell key={entry.device} fill={DEVICE_COLORS[entry.device.toLowerCase()] ?? "#6b7280"} />
                      ))}
                    </Bar>
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
  subColor = "neutral",
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  subColor?: "good" | "bad" | "neutral"
}) {
  const subCls =
    subColor === "good"
      ? "text-emerald-500"
      : subColor === "bad"
      ? "text-red-500"
      : "text-gray-400 dark:text-gray-500"

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23]">
      <div className="inline-flex p-2 rounded-lg bg-gray-100 dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400 mb-4">
        {icon}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className={`text-xs mt-2 ${subCls}`}>{sub}</p>
    </div>
  )
}
