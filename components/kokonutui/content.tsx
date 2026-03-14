"use client"

import { Clock, Sparkles, FlaskConical, PlugZap, Loader2, Zap, BarChart2, Monitor } from "lucide-react"
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
  todayEntries,
  dailyCo2,
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

  // Derived metric values
  const latestCo2 = co2Sessions.at(-1)?.co2 ?? 0
  const prevCo2 = co2Sessions.at(-2)?.co2 ?? null
  const co2TrendPct = prevCo2 ? Math.round((latestCo2 - prevCo2) / prevCo2 * 100) : null
  const avgCo2 = analysesCount > 0 ? Math.round(totalCo2 / analysesCount) : 0
  const topDevice = deviceHours.slice().sort((a, b) => b.hours - a.hours)[0] ?? null

  const fmtCo2 = (g: number) => g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`

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
                const todayCo2 = dailyCo2.at(-1)?.co2 ?? 0
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
                const weekAvg = nonZero.length ? Math.round(nonZero.reduce((s, d) => s + d.co2, 0) / nonZero.length) : 0
                return (
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
                      <Tooltip content={<ChartTooltip unit="g CO₂" />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1, strokeDasharray: "4 2" }} />
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
