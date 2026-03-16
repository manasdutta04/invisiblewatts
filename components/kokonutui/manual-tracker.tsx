"use client"

import { useState } from "react"
import { Loader2, Plus, Sparkles, Wifi, BatteryCharging, Leaf } from "lucide-react"
import { DATA_GB_PER_HOUR, KWH_PER_GB, GRID_G_PER_KWH } from "@/lib/constants"
import { useRouter } from "next/navigation"

const DEVICES = ["phone", "laptop", "tablet", "desktop", "smart_tv", "console", "smartwatch"]
const ACTIVITIES = ["streaming", "gaming", "social", "calls", "browsing", "productivity", "mixed"]

type TimeUnit = "hr" | "min" | "sec"

export default function ManualTracker({ isDemoMode }: { isDemoMode?: boolean }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [device, setDevice] = useState("phone")
  const [activity, setActivity] = useState("mixed")
  const [hours, setHours] = useState<number | "">("")
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("hr")

  // Instant calculation preview (convert raw input to hours)
  const rawInput = typeof hours === "number" ? hours : 0
  const parsedHours = timeUnit === "min" ? rawInput / 60 : timeUnit === "sec" ? rawInput / 3600 : rawInput
  
  const gbPerHr = DATA_GB_PER_HOUR[activity] ?? 0.1
  const dataGb = parsedHours > 0 ? Math.round(parsedHours * gbPerHr * 100) / 100 : 0
  const energyKwh = dataGb > 0 ? Math.round(dataGb * KWH_PER_GB * 100) / 100 : 0
  const carbonG = energyKwh > 0 ? Math.round(energyKwh * GRID_G_PER_KWH) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (parsedHours <= 0 || isDemoMode) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          device_type: device,
          activity_type: activity,
          daily_hours: parsedHours,
        }),
      })

      if (res.ok) {
        setHours("")
        // Refresh triggers a server component reload, showing the new entry
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#1F1F23]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Manual Entry
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Log a single activity directly. We'll instantly calculate your digital carbon footprint.
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full gap-6">
          
          {/* Inputs Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Device</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1A1A1F] border border-gray-200 dark:border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                >
                  {DEVICES.map((d) => (
                    <option key={d} value={d}>{capitalize(d)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Activity</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1A1A1F] border border-gray-200 dark:border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                >
                  {ACTIVITIES.map((a) => (
                    <option key={a} value={a}>{capitalize(a)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Duration</label>
              <div className="flex rounded-lg border border-gray-200 dark:border-[#2B2B30] overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder={`e.g. ${timeUnit === "hr" ? "2.5" : timeUnit === "min" ? "45" : "120"}`}
                  value={hours}
                  onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : "")}
                  className="w-full min-w-0 px-3 py-2 text-sm bg-gray-50 dark:bg-[#1A1A1F] text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
                  required
                />
                <div className="flex border-l border-gray-200 dark:border-[#2B2B30] flex-shrink-0 bg-gray-50 dark:bg-[#1A1A1F]">
                  {(["hr", "min", "sec"] as TimeUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setTimeUnit(unit)}
                      className={`px-3 text-xs font-semibold transition-colors ${
                        unit !== "hr" ? "border-l border-gray-200 dark:border-[#2B2B30]" : ""
                      } ${
                        timeUnit === unit
                          ? "bg-indigo-600 text-white"
                          : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Instant Preview Section */}
          <div className="mt-auto bg-gray-50 dark:bg-[#131316] border border-gray-100 dark:border-[#1F1F23] rounded-xl p-4 flex flex-col justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Instant Preview</h4>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Data Preview */}
              <div className="bg-white dark:bg-[#0F0F12] border border-gray-100 dark:border-[#1F1F23] rounded-lg p-3 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Data</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight tabular-nums">{dataGb}</p>
                <p className="text-[10px] font-medium text-gray-400">GB</p>
              </div>

              {/* Energy Preview */}
              <div className="bg-white dark:bg-[#0F0F12] border border-gray-100 dark:border-[#1F1F23] rounded-lg p-3 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Energy</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight tabular-nums">{energyKwh}</p>
                <p className="text-[10px] font-medium text-gray-400">kWh</p>
              </div>

              {/* Carbon Preview */}
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Carbon</span>
                </div>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tracking-tight tabular-nums">
                  {carbonG}
                </p>
                <p className="text-[10px] font-medium opacity-70 text-emerald-700 dark:text-emerald-500">g CO₂</p>
              </div>
            </div>

            <div className="mt-6">
              {isDemoMode && (
                <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 mb-2 text-center">
                  Demo mode — saving disabled
                </p>
              )}
              <button
                type="submit"
                disabled={!parsedHours || isSubmitting || isDemoMode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? "Saving..." : "Log Activity"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
