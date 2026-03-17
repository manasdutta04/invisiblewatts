"use client"

import { Clock, Sparkles, FlaskConical, PlugZap, Loader2, Zap, BarChart2, Monitor, IndianRupee, Info, Wifi, BatteryCharging, Leaf, Smartphone, Car, Fan, Users, Building2, TrendingDown, CheckCircle2, MousePointer2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell, Label,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts"

interface Co2Session {
  date: string
  co2: number
}

interface DeviceHour {
  device: string
  hours: number
}

interface DailyCo2 {
  day: string
  co2: number
}

interface TodayEntry {
  label: string
  hours: number
  co2: number
  device: string
}

interface ContentProps {
  userName: string
  totalCo2: number
  totalCostRupees: number
  totalHours: number
  totalEntries: number
  analysesCount: number
  todayEntryCount: number
  todayEntries: TodayEntry[]
  dailyCo2: DailyCo2[]
  co2Sessions: Co2Session[]
  deviceHours: DeviceHour[]
  latestRecs: string[]
  latestSummary: string | null
  isDemoMode?: boolean
  hasNewEntries?: boolean
  unanalyzedCount?: number
  // Data-pipeline metrics
  totalDataGB: number
  totalEnergyKwh: number
  dataBasedCo2: number
  streamingHours: number
  gamingHours: number
  uniqueDaysCount: number
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
  totalCostRupees,
  totalHours,
  totalEntries,
  analysesCount,
  todayEntryCount,
  todayEntries,
  dailyCo2,
  co2Sessions,
  deviceHours,
  latestRecs,
  latestSummary,
  isDemoMode,
  hasNewEntries,
  unanalyzedCount,
  totalDataGB,
  totalEnergyKwh,
  dataBasedCo2,
  streamingHours,
  gamingHours,
  uniqueDaysCount,
}: ContentProps) {
  const isEmpty = totalEntries === 0 && co2Sessions.length === 0
  const needsAnalysis = !isDemoMode && ((totalEntries > 0 && co2Sessions.length === 0) || !!hasNewEntries)
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chartTab, setChartTab] = useState<"Today" | "7D" | "All">("7D")

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

  const [appliedActions, setAppliedActions] = useState<string[]>([])

  const actions = [
    { id: "stream", label: "Reduce Streaming Quality", reduction: 200, icon: <Monitor className="w-4 h-4" /> },
    { id: "screen", label: "Limit Screen Time", reduction: 150, icon: <Clock className="w-4 h-4" /> },
    { id: "dark", label: "Enable Dark Mode", reduction: 50, icon: <Sparkles className="w-4 h-4" /> },
  ]

  const totalReduction = actions
    .filter(a => appliedActions.includes(a.id))
    .reduce((sum, a) => sum + a.reduction, 0)

  const toggleAction = (id: string) => {
    setAppliedActions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Derived metric values
  const latestCo2 = co2Sessions.at(-1)?.co2 ?? 0
  const prevCo2 = co2Sessions.at(-2)?.co2 ?? null
  const co2TrendPct = prevCo2 ? Math.round((latestCo2 - prevCo2) / prevCo2 * 100) : null
  const avgCo2 = analysesCount > 0 ? Math.round(totalCo2 / analysesCount) : 0
  const topDevice = deviceHours.slice().sort((a, b) => b.hours - a.hours)[0] ?? null

  const fmtCo2 = (g: number) => g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`

  const greeting = getGreeting()
  const firstName = userName.split(" ")[0]

  const calculateScore = () => {
    if (totalHours === 0) return 100
    const avgDailyHours = totalHours / uniqueDaysCount
    const dailyData = totalDataGB / uniqueDaysCount
    const avgStreaming = streamingHours / uniqueDaysCount
    const avgGaming = gamingHours / uniqueDaysCount

    let score = 100
    // Deduct up to 25 pts for high screen time (8h = max deduction)
    score -= Math.min(25, (avgDailyHours / 8) * 25)
    // Deduct up to 25 pts for high data usage (5GB/day = max)
    score -= Math.min(25, (dailyData / 5) * 25)
    // Deduct up to 25 pts for streaming (4h/day = max)
    score -= Math.min(25, (avgStreaming / 4) * 25)
    // Deduct up to 25 pts for gaming (2h/day = max)
    score -= Math.min(25, (avgGaming / 2) * 25)

    return Math.max(0, Math.round(score))
  }

  const carbonScore = calculateScore()
  const scoreStatus = carbonScore >= 90 ? "Green User" : carbonScore >= 70 ? "Moderate" : "High Digital Carbon"
  const scoreColor = carbonScore >= 90 ? "#10b981" : carbonScore >= 70 ? "#f59e0b" : "#ef4444"
  const scoreData = [
    { name: "Score", value: carbonScore },
    { name: "Remaining", value: 100 - carbonScore }
  ]

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
          {/* Metric Cards section */}
          <div className="space-y-4">
            {/* Section label row with info button */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Overview</span>
              <CarbonInfoTooltip />
            </div>

            {/* ── Digital Footprint — single-row table card ── */}
            <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-[#1F1F23]">

                {/* Data Used */}
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Data Used</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums leading-tight">
                      {totalDataGB > 0 ? `${totalDataGB} GB` : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {totalDataGB > 0 ? "from screen-time entries" : "no entries yet"}
                    </p>
                  </div>
                </div>

                {/* Energy Used */}
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 dark:text-cyan-400">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Energy Used</p>
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums leading-tight">
                      {totalEnergyKwh > 0 ? `${totalEnergyKwh} kWh` : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {totalEnergyKwh > 0 ? `${totalDataGB} GB × 0.06 kWh/GB` : "no entries yet"}
                    </p>
                  </div>
                </div>

                {/* Carbon Emitted */}
                <div className="flex items-center gap-3 px-5 py-5">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Carbon Emitted</p>
                    <p className={`text-2xl font-bold tabular-nums leading-tight ${dataBasedCo2 > 500 ? "text-red-500" : dataBasedCo2 > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                      {dataBasedCo2 > 0 ? (dataBasedCo2 >= 1000 ? `${(dataBasedCo2 / 1000).toFixed(2)} kg CO₂` : `${dataBasedCo2} g CO₂`) : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {dataBasedCo2 > 0 ? `${totalEnergyKwh} kWh × 475 g/kWh` : "no entries yet"}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── 5 session-based metric cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <MetricCard
                icon={<IndianRupee className="w-4 h-4" />}
                label="Est. Energy Cost"
                value={totalCostRupees > 0 ? `₹${totalCostRupees.toFixed(2)}` : "—"}
                sub={totalCostRupees > 0 ? "based on ₹7/kWh tariff" : "no analyses yet"}
                subColor="neutral"
                valueColor="amber"
              />
            </div> {/* end 5-card grid */}
          </div> {/* end metric cards section */}

          {/* Performance Benchmark */}
          {(() => {
            const weekTotal = dailyCo2.reduce((s, d) => s + d.co2, 0)
            const AVG_WEEKLY_CO2 = 600 // gCO₂ — global average for digital activity
            const pctDiff = Math.round(Math.abs(AVG_WEEKLY_CO2 - weekTotal) / AVG_WEEKLY_CO2 * 100)
            const isBetter = weekTotal < AVG_WEEKLY_CO2
            if (weekTotal === 0) return null
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Performance Benchmark</span>
                </div>
                <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-5">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Stat pair */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Your weekly CO₂</p>
                        <p className={`text-2xl font-bold tabular-nums ${isBetter ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                          {fmtCo2(weekTotal)}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-gray-200 dark:bg-[#1F1F23] hidden sm:block" />
                      <div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">Average user</p>
                        <p className="text-2xl font-bold text-gray-400 dark:text-gray-500 tabular-nums">{fmtCo2(AVG_WEEKLY_CO2)}</p>
                      </div>
                    </div>
                    {/* Bar + verdict */}
                    <div className="flex-1 w-full md:w-auto">
                      {/* Progress bar where the avg marker sits at 67% (600 / 900) */}
                      <div className="relative h-2 bg-gray-100 dark:bg-[#1A1A1F] rounded-full overflow-hidden mb-3">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${isBetter ? "bg-emerald-500" : "bg-red-400"}`}
                          style={{ width: `${Math.min(Math.round((weekTotal / 900) * 100), 100)}%` }}
                        />
                        {/* Average line at 66.7% */}
                        <div className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-gray-500 opacity-60" style={{ left: "66.7%" }} />
                      </div>
                      <p className={`text-sm font-semibold flex items-center gap-1.5 ${isBetter ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {isBetter ? (
                          <><span>✅</span><span>You are {pctDiff}% better than average</span></>
                        ) : (
                          <><span>⚠️</span><span>You are {pctDiff}% above average emissions</span></>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Your Carbon Impact section */}
          {dataBasedCo2 > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Your Carbon Impact</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Equivalent to</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                      Charging {Math.round((dataBasedCo2 / 100) * 12)} smartphones
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Equivalent to</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                      Driving {((dataBasedCo2 / 500) * 2).toFixed(1).replace(/\.0$/, '')} km in a car
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400">
                    <Fan className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Equivalent to</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                      Running a fan for {((dataBasedCo2 / 1000) * 30).toFixed(1).replace(/\.0$/, '')} hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts — side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Trend Chart — tabbed */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
            {/* Card header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Digital CO₂ Trend</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {chartTab === "Today" && "Estimated carbon from today's screen time"}
                  {chartTab === "7D"    && "Daily estimated CO₂ over the last 7 days"}
                  {chartTab === "All"   && "CO₂ produced per AI analysis session"}
                </p>
              </div>
              {/* Tab pills */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-[#1A1A1F]">
                {(["Today", "7D", "All"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartTab(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      chartTab === t
                        ? "bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              {/* ── TODAY ── */}
              {chartTab === "Today" && (() => {
                const todayCo2 = todayEntries.reduce((s, e) => s + e.co2, 0)
                const yesterdayCo2 = dailyCo2.at(-2)?.co2 ?? null
                const diff = yesterdayCo2 ? Math.round((todayCo2 - yesterdayCo2) / Math.max(yesterdayCo2, 1) * 100) : null
                return (
                  <div>
                    {/* Today stat strip */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{fmtCo2(todayCo2)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">today</span>
                      {diff !== null && (
                        <span className={`text-xs font-medium ${diff <= 0 ? "text-emerald-500" : "text-red-400"}`}>
                          {diff > 0 ? "+" : ""}{diff}% vs yesterday
                        </span>
                      )}
                      {todayEntryCount > 0 && (
                        <span className="ml-auto text-xs text-gray-400">{todayEntryCount} {todayEntryCount === 1 ? "entry" : "entries"}</span>
                      )}
                    </div>
                    {todayEntries.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={todayEntries} barSize={48} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                          <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.12)" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="g" tick={{ fontSize: 11 }} width={42} />
                          <Tooltip content={<ChartTooltip unit="g CO₂" />} cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }} />
                          <Bar dataKey="co2" radius={[6, 6, 0, 0]}>
                            {todayEntries.map((e, i) => (
                              <Cell key={i} fill={DEVICE_COLORS[e.device] ?? "#6366f1"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[220px] text-sm text-gray-400 dark:text-gray-500">
                        No entries logged today
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── 7D ── */}
              {chartTab === "7D" && (() => {
                const hasData = dailyCo2.some((d) => d.co2 > 0)
                const nonZero = dailyCo2.filter((d) => d.co2 > 0)
                const weekTotal = dailyCo2.reduce((s, d) => s + d.co2, 0)
                const weekAvg = nonZero.length ? Math.round(nonZero.reduce((s, d) => s + d.co2, 0) / nonZero.length) : 0
                return (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                      <div className="bg-gray-50 dark:bg-[#1A1A1F] px-5 py-4 rounded-xl border border-gray-100 dark:border-[#2A2A30] w-full sm:flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Weekly CO₂</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtCo2(weekTotal)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#1A1A1F] px-5 py-4 rounded-xl border border-gray-100 dark:border-[#2A2A30] w-full sm:flex-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Daily CO₂</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtCo2(weekAvg)}</p>
                      </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={dailyCo2} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.12)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="g" tick={{ fontSize: 11 }} width={42} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null
                            const fDays: Record<string, string> = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" }
                            const fDay = label ? (fDays[label as string] || label) : ""
                            return (
                              <div style={{ background: "rgba(15,15,18,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: "110px" }}>
                                <p style={{ color: "#818cf8", fontSize: "14px", fontWeight: 700, margin: 0 }}>
                                  {fDay}: {payload[0].value}g CO₂
                                </p>
                              </div>
                            )
                          }}
                          cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1, strokeDasharray: "4 2" }} 
                        />
                        {hasData && weekAvg > 0 && (
                          <ReferenceLine
                            y={weekAvg}
                            stroke="#a5b4fc"
                            strokeDasharray="5 3"
                            strokeWidth={1.5}
                            label={{ value: `avg ${weekAvg}g`, position: "insideTopRight", fill: "#a5b4fc", fontSize: 10, dy: -8 }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="co2"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#areaGrad)"
                          dot={{ r: 3.5, fill: "#6366f1", strokeWidth: 0 }}
                          activeDot={{ r: 5.5, fill: "#818cf8", strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )
              })()}

              {/* ── ALL ── */}
              {chartTab === "All" && (
                co2Sessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={co2Sessions} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="areaGradAll" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(156,163,175,0.12)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" unit="g" tick={{ fontSize: 11 }} width={42} />
                      <Tooltip content={<ChartTooltip unit="g CO₂" />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1, strokeDasharray: "4 2" }} />
                      {co2Sessions.length > 1 && (
                        <ReferenceLine
                          y={avgCo2}
                          stroke="#a5b4fc"
                          strokeDasharray="5 3"
                          strokeWidth={1.5}
                          label={{ value: `avg ${avgCo2}g`, position: "insideTopRight", fill: "#a5b4fc", fontSize: 10, dy: -8 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="co2"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#areaGradAll)"
                        dot={{ r: 3.5, fill: "#6366f1", strokeWidth: 0 }}
                        activeDot={{ r: 5.5, fill: "#818cf8", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-sm text-gray-400 dark:text-gray-500">
                    No analysis sessions yet
                  </div>
                )
              )}
            </div>
          </div>

          {/* Hours by Device — donut */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Hours by Device</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribution of logged screen time</p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col items-center">
              {deviceHours.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={deviceHours}
                        dataKey="hours"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {deviceHours.map((entry) => (
                          <Cell key={entry.device} fill={DEVICE_COLORS[entry.device.toLowerCase()] ?? "#6b7280"} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            const { cx, cy } = viewBox as { cx: number; cy: number }
                            const totalHrs = deviceHours.reduce((s, d) => s + d.hours, 0)
                            return (
                              <g>
                                <text x={cx} y={cy - 6} textAnchor="middle" fill="#6366f1" fontSize={22} fontWeight={700}>
                                  {totalHrs.toFixed(1)}h
                                </text>
                                <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7280" fontSize={11}>
                                  total hours
                                </text>
                              </g>
                            )
                          }}
                        />
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload as DeviceHour
                          const color = DEVICE_COLORS[d.device.toLowerCase()] ?? "#6b7280"
                          return (
                            <div style={{ background: "rgba(15,15,18,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 14px", minWidth: "110px" }}>
                              <p style={{ color: "#6b7280", fontSize: "11px", marginBottom: "5px" }}>{d.device}</p>
                              <p style={{ color, fontSize: "15px", fontWeight: 700, margin: 0 }}>{d.hours}h</p>
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
                    {deviceHours.map((d) => {
                      const total = deviceHours.reduce((s, x) => s + x.hours, 0)
                      const pct = total > 0 ? Math.round(d.hours / total * 100) : 0
                      const color = DEVICE_COLORS[d.device.toLowerCase()] ?? "#6b7280"
                      return (
                        <div key={d.device} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{d.device}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{d.hours}h</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-sm text-gray-400 dark:text-gray-500">
                  No device data yet
                </div>
              )}
            </div>
          </div>

          </div> {/* end charts grid */}

          {/* Digital Carbon Score */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-[#1F1F23]">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Digital Carbon Score</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Based on your daily screen time, streaming, gaming & data usage</p>
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col md:flex-row items-center gap-8 justify-center">
              <div className="w-[200px] h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={90}
                      startAngle={90} endAngle={-270}
                      dataKey="value" stroke="none"
                    >
                      <Cell fill={scoreColor} />
                      <Cell fill="rgba(156,163,175,0.12)" />
                      <Label
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox as { cx: number; cy: number }
                          return (
                            <g>
                              <text x={cx} y={cy - 5} textAnchor="middle" fill={scoreColor} fontSize={32} fontWeight={700}>
                                {carbonScore}
                              </text>
                              <text x={cx} y={cy + 20} textAnchor="middle" fill="#6b7280" fontSize={14}>
                                / 100
                              </text>
                            </g>
                          )
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-xl font-bold" style={{ color: scoreColor }}>{scoreStatus}</p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-[#1F1F23]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 90–100: Green User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 70–89: Moderate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Below 70: High Digital Carbon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise Carbon Dashboard (Placeholder) */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Enterprise Carbon Dashboard
                </h2>
              </div>
              <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">Coming Soon</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-[#1F1F23]">
              Track and analyze team-level digital carbon emissions across your entire organization. Identify high-impact areas, set sustainability goals, and foster a greener digital workplace.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-75 grayscale-[0.3]">
              <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-lg p-4 border border-gray-100 dark:border-[#2A2A30]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Employees Tracked</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1,248</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-lg p-4 border border-gray-100 dark:border-[#2A2A30]">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Emissions</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">4.2 t CO₂</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-lg p-4 border border-gray-100 dark:border-[#2A2A30]">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Top Dept (Eng)</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">1.8 t CO₂</p>
              </div>
              <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-lg p-4 border border-gray-100 dark:border-[#2A2A30]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-cyan-500" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Sustainability</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">84 / 100</p>
              </div>
            </div>
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

          {/* Take Action Section */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MousePointer2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Take Action
                </h2>
              </div>
              {totalReduction > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Est. Saved: {totalReduction}g CO₂ / week
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actions.map((action) => {
                const isApplied = appliedActions.includes(action.id)
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={`
                      relative flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300
                      ${isApplied 
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10" 
                        : "bg-gray-50 dark:bg-[#1A1A1F] border-gray-100 dark:border-[#2A2A30] text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-[#3A3A40] hover:bg-gray-100 dark:hover:bg-[#202025]"
                      }
                    `}
                  >
                    <div className={`
                      p-2.5 rounded-lg mb-3 transition-colors duration-300
                      ${isApplied ? "bg-emerald-500 text-white" : "bg-white dark:bg-[#0F0F12] border border-gray-100 dark:border-[#1F1F23]"}
                    `}>
                      {isApplied ? <CheckCircle2 className="w-5 h-5" /> : action.icon}
                    </div>
                    <span className="text-sm font-bold text-center leading-tight mb-1">{action.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${isApplied ? "text-emerald-500" : "text-gray-400"}`}>
                      {isApplied ? "Applied" : `-${action.reduction}g CO₂ / week`}
                    </span>
                    {isApplied && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {!appliedActions.length && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 italic">
                Select an action above to see how much carbon you can save.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CarbonInfoTooltip() {
  return (
    <div className="relative group inline-flex items-center">
      {/* Trigger button */}
      <button
        type="button"
        aria-label="How Digital Carbon is Calculated"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
          text-indigo-600 dark:text-indigo-400
          bg-indigo-50 dark:bg-indigo-900/30
          border border-indigo-200 dark:border-indigo-700/50
          hover:bg-indigo-100 dark:hover:bg-indigo-900/50
          transition-colors cursor-default select-none"
      >
        <Info className="w-3 h-3" />
        How Digital Carbon is Calculated
      </button>

      {/* Tooltip popover */}
      <div
        className="
          pointer-events-none absolute z-50 bottom-full left-0 mb-2
          w-80 rounded-xl
          bg-white dark:bg-[#131316]
          border border-gray-200 dark:border-[#2A2A30]
          shadow-2xl shadow-black/20
          opacity-0 -translate-y-1 scale-95
          group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
          transition-all duration-200 ease-out
        "
        role="tooltip"
      >
        {/* Arrow */}
        <div className="absolute -bottom-1.5 left-5 w-3 h-3 rotate-45 bg-white dark:bg-[#131316] border-r border-b border-gray-200 dark:border-[#2A2A30]" />

        <div className="px-4 py-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">How Digital Carbon is Calculated</p>
          </div>

          {/* Pipeline */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">GB</span>
            <span className="text-gray-400">× 0.06</span>
            <span className="px-2 py-1 rounded-md bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-bold">kWh</span>
            <span className="text-gray-400">× 475</span>
            <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold">g CO₂</span>
          </div>

          {/* Data rates */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Data rate per activity (GB/hr)</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                ["Streaming", "3.0"],
                ["Calls",      "1.0"],
                ["Social",    "0.5"],
                ["Mixed",     "0.5"],
                ["Gaming",    "0.1"],
                ["Browsing",  "0.1"],
                ["Productivity", "0.05"],
              ].map(([act, val]) => (
                <div key={act} className="flex justify-between">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{act}</span>
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{val} GB/hr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion notes */}
          <div className="rounded-lg bg-gray-50 dark:bg-[#1A1A1F] border border-gray-100 dark:border-[#2A2A30] px-3 py-2 space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-500">1 GB</span> ≈ 0.06 kWh &nbsp;·&nbsp; per IEA network energy model
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-cyan-500">1 kWh</span> ≈ 475 g CO₂ &nbsp;·&nbsp; India grid emission factor
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              <span className="font-semibold">Est. Cost:</span> kWh × ₹7/kWh (India avg tariff)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  subColor = "neutral",
  valueColor = "default",
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  subColor?: "good" | "bad" | "neutral"
  valueColor?: "default" | "amber"
  accent?: "indigo" | "cyan" | "emerald"
}) {
  const subCls =
    subColor === "good"
      ? "text-emerald-500"
      : subColor === "bad"
      ? "text-red-500"
      : "text-gray-400 dark:text-gray-500"

  const valueCls = valueColor === "amber"
    ? "text-amber-500 dark:text-amber-400"
    : accent === "indigo"
    ? "text-indigo-600 dark:text-indigo-400"
    : accent === "cyan"
    ? "text-cyan-600 dark:text-cyan-400"
    : accent === "emerald"
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-gray-900 dark:text-white"

  const iconCls =
    accent === "indigo"
      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400"
      : accent === "cyan"
      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 dark:text-cyan-400"
      : accent === "emerald"
      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400"
      : valueColor === "amber"
      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400"
      : "bg-gray-100 dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400"

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div className={`inline-flex p-1.5 rounded-lg mb-2.5 ${iconCls}`}>
        {icon}
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-0.5">{label}</p>
      <p className={`text-xl font-bold ${valueCls}`}>{value}</p>
      <p className={`text-[10px] mt-1.5 ${subCls}`}>{sub}</p>
    </div>
  )
}
