"use client"

import { useState } from "react"
import { FileText, Download, Leaf, Calendar, Sparkles, UploadCloud, Activity, TrendingDown } from "lucide-react"
import Link from "next/link"
import type { AiAnalysis } from "@/lib/supabase/types"

type Filter = "all" | "this_month" | "last_month"

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function isLastMonth(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d.getFullYear() === last.getFullYear() && d.getMonth() === last.getMonth()
}

function formatCo2(grams: number | null) {
  if (grams == null) return "—"
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg CO₂` : `${grams.toFixed(0)} g CO₂`
}

function formatCost(grams: number | null) {
  if (grams == null) return "—"
  const inr = (grams / 475) * 7
  return `₹${inr.toFixed(4)}`
}

function relativeDate(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 30) return `${diff} days ago`
  if (diff < 60) return "Last month"
  return `${Math.floor(diff / 30)} months ago`
}

function impactLevel(grams: number | null) {
  if (grams == null) return "unknown"
  if (grams < 100) return "low"
  if (grams < 500) return "medium"
  return "high"
}

const IMPACT = {
  low:     { label: "Low Impact",      labelColor: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20",  border: "border-l-emerald-500", co2Color: "text-emerald-600 dark:text-emerald-400" },
  medium:  { label: "Moderate Impact", labelColor: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-900/20",       border: "border-l-amber-500",   co2Color: "text-amber-600 dark:text-amber-400" },
  high:    { label: "High Impact",     labelColor: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-900/20",           border: "border-l-red-500",     co2Color: "text-red-600 dark:text-red-400" },
  unknown: { label: "Unknown",         labelColor: "text-gray-500 dark:text-gray-400",       bg: "bg-gray-100 dark:bg-[#1F1F23]",          border: "border-l-gray-300",    co2Color: "text-gray-900 dark:text-white" },
}

function downloadReport(analysis: AiAnalysis) {
  const recs = (analysis.recommendations as string[]).map((r, i) => `  ${i + 1}. ${r}`).join("\n")
  const text = [
    "═══════════════════════════════════════",
    "  InvisibleWatts — Digital Carbon Report",
    "═══════════════════════════════════════",
    "",
    `Generated: ${new Date(analysis.created_at).toLocaleString()}`,
    `Entries analysed: ${analysis.entry_count}`,
    `CO₂ estimate: ${formatCo2(analysis.co2_estimate_grams)}`,
    `Est. energy cost: ${formatCost(analysis.co2_estimate_grams)} (at ₹7/kWh)`,
    "",
    "── Summary ─────────────────────────────",
    analysis.summary,
    "",
    "── Recommendations ──────────────────────",
    recs,
    "",
    "═══════════════════════════════════════",
    "InvisibleWatts — invisiblewatts.vercel.app",
  ].join("\n")

  const blob = new Blob([text], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `iw-report-${analysis.created_at.slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsContent({
  analyses,
  entriesTotal,
}: {
  analyses: AiAnalysis[]
  entriesTotal: number
}) {
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = analyses.filter((a) => {
    if (filter === "this_month") return isThisMonth(a.created_at)
    if (filter === "last_month") return isLastMonth(a.created_at)
    return true
  })

  const totalCo2 = analyses.reduce((s, a) => s + (a.co2_estimate_grams ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            AI-generated digital carbon footprint reports
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all"
        >
          <Sparkles className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Stats strip */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Reports</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex-shrink-0">
              <Activity className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Entries Analysed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{entriesTotal}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total CO₂ Tracked</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCo2(totalCo2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs — segmented pill */}
      {analyses.length > 0 && (
        <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-[#1F1F23] gap-1">
          {(["all", "this_month", "last_month"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? "bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {f === "all" ? "All" : f === "this_month" ? "This Month" : "Last Month"}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No reports yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Upload your device usage data and run an AI analysis to generate your first report.
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Usage Data
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          No reports for this period.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((analysis, i) => (
            <ReportCard key={analysis.id} analysis={analysis} reportNumber={filtered.length - i} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({ analysis, reportNumber }: { analysis: AiAnalysis; reportNumber: number }) {
  const recs = analysis.recommendations as string[]
  const date = new Date(analysis.created_at)
  const level = impactLevel(analysis.co2_estimate_grams)
  const cfg = IMPACT[level]

  return (
    <div className={`bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] border-l-4 ${cfg.border} transition-shadow hover:shadow-md overflow-hidden`}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1F1F23] flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
            #{reportNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Digital Carbon Report</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.labelColor}`}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>{relativeDate(analysis.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide mb-0.5">CO₂</p>
            <p className={`text-base font-bold ${cfg.co2Color}`}>{formatCo2(analysis.co2_estimate_grams)}</p>
          </div>
          <div className="text-right pl-5 border-l border-gray-100 dark:border-[#1F1F23]">
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide mb-0.5">Est. Cost</p>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400">{formatCost(analysis.co2_estimate_grams)}</p>
          </div>
          <div className="text-right pl-5 border-l border-gray-100 dark:border-[#1F1F23]">
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide mb-0.5">Entries</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">{analysis.entry_count}</p>
          </div>
          <button
            onClick={() => downloadReport(analysis)}
            title="Download report"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2B2B30] hover:bg-gray-50 dark:hover:bg-[#1F1F23] text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-[#1F1F23]">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>

        {recs.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {recs.length} Recommendation{recs.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2.5">
              {recs.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
