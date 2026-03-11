"use client"

import { Leaf, ChevronRight, Clock, Sparkles, UploadCloud } from "lucide-react"
import Link from "next/link"
import type { AiAnalysis } from "@/lib/supabase/types"

export default function AiInsightsContent({ analyses }: { analyses: AiAnalysis[] }) {
  if (analyses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of your digital carbon footprint
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
            <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No AI analysis yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Upload your device screen time data to get a personalized digital carbon footprint analysis.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(latest.recommendations as string[]).map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23]"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis history */}
      {analyses.length > 1 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Analysis History
          </h2>
          <div className="space-y-3">
            {analyses.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23]"
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{a.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                    <span>{a.entry_count} {a.entry_count === 1 ? "entry" : "entries"}</span>
                    {a.co2_estimate_grams != null && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {a.co2_estimate_grams >= 1000
                          ? `${(a.co2_estimate_grams / 1000).toFixed(2)} kg CO₂`
                          : `${a.co2_estimate_grams.toFixed(0)} g CO₂`}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
