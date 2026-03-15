"use client"

import { Leaf, ChevronRight, Clock, Sparkles, UploadCloud, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AiAnalysis } from "@/lib/supabase/types"

export default function AiInsightsContent({
  analyses,
  entryCount = 0,
}: {
  analyses: AiAnalysis[]
  entryCount?: number
}) {
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
      if (res.ok) router.refresh()
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of your digital carbon footprint
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          {entryCount > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {entryCount} {entryCount === 1 ? "entry" : "entries"} ready to analyse
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                You have saved usage data but no CO₂ analysis yet. Run an analysis to see your digital carbon footprint.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                No AI analysis yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Upload your device screen time data to get a personalized digital carbon footprint analysis.
              </p>
            </div>
          )}
          {entryCount > 0 ? (
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 text-white text-sm font-semibold transition-all"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAnalyzing ? "Analysing…" : "Analyse My Data"}
            </button>
          ) : (
            <Link
              href="/upload"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Usage Data
            </Link>
          )}
        </div>
      </div>
    )
  }

  const latest = analyses[0]
  const totalCo2 = analyses.reduce((s, a) => s + (a.co2_estimate_grams ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of your digital carbon footprint
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          Add Data
        </Link>
      </div>

      {/* Summary hero */}
      <div className="rounded-xl p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-white/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 mb-1">
              Total Digital CO₂ ({analyses.length} {analyses.length === 1 ? "analysis" : "analyses"})
            </p>
            <p className="text-4xl font-bold mb-2">
              {totalCo2 >= 1000
                ? `${(totalCo2 / 1000).toFixed(2)} kg`
                : `${totalCo2.toFixed(0)} g`}{" "}
              CO₂
            </p>
            <p className="text-sm text-white/80">{latest.summary}</p>
          </div>
        </div>
      </div>

      {/* Latest recommendations */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Latest Recommendations
        </h2>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {(latest.recommendations as string[])
              .slice(0, 3)
              .map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec}
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Analysis history */}
      {analyses.length > 1 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Analysis History
          </h2>
          <div className="rounded-xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>CO₂ Estimate</TableHead>
                  <TableHead>Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{a.entry_count} {a.entry_count === 1 ? "entry" : "entries"}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400 font-medium">
                      {a.co2_estimate_grams != null
                        ? a.co2_estimate_grams >= 1000
                          ? `${(a.co2_estimate_grams / 1000).toFixed(2)} kg CO₂`
                          : `${a.co2_estimate_grams.toFixed(0)} g CO₂`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{a.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
