"use client"

import { User, Target, Database, Loader2 } from "lucide-react"
import { updateProfile, updateGoals, clearUsageData } from "@/app/settings/actions"
import { createClient } from "@/lib/supabase/client"
import type { Profile, UserPreferences } from "@/lib/supabase/types"
import { useState, useTransition } from "react"

export default function SettingsContent({
  profile,
  prefs,
  entryCount,
  analysisCount,
}: {
  profile: Profile | null
  prefs: UserPreferences | null
  entryCount: number
  analysisCount: number
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [isClearing, startClearTransition] = useTransition()
  const [confirmClear, setConfirmClear] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("usage_entries")
        .select("date,device_type,daily_hours,activity_type,notes")
        .order("date", { ascending: false })

      if (!data || data.length === 0) return

      const header = "Date,Device,Hours,Activity,Notes"
      const rows = data.map((e) =>
        [e.date, e.device_type, e.daily_hours, e.activity_type, e.notes ?? ""].join(",")
      )
      const csv = [header, ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invisiblewatts-data-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    startClearTransition(async () => {
      await clearUsageData()
      setConfirmClear(false)
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <SettingSection icon={<User className="w-5 h-5" />} title="Account" description="Your profile and login details">
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Full Name</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Email</label>
            <p className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2B2B30] rounded-lg">
              {profile?.email ?? "—"}
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </SettingSection>

      {/* Carbon Goals */}
      <SettingSection icon={<Target className="w-5 h-5" />} title="Carbon Goals" description="Set personal targets to reduce your digital carbon footprint">
        <form action={updateGoals} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Daily CO₂ Target
            </label>
            <div className="flex items-center gap-2">
              <input
                name="daily_co2_target"
                type="number"
                min={0}
                defaultValue={prefs?.daily_kwh_target ?? 500}
                className="w-28 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">g CO₂ / day</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Average: ~400 g/day for a typical phone + laptop user
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Weekly Screen Time Goal
            </label>
            <div className="flex items-center gap-2">
              <input
                name="weekly_screen_time"
                type="number"
                min={0}
                defaultValue={prefs?.monthly_budget_dollars ?? 21}
                className="w-28 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">hours / week</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              WHO recommends limiting recreational screen time to 2–3 hrs/day
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Goals
          </button>
        </form>
      </SettingSection>

      {/* Your Data */}
      <SettingSection icon={<Database className="w-5 h-5" />} title="Your Data" description="Manage the usage data you've uploaded">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1F1F23] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{entryCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Usage entries</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1F1F23] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysisCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI analyses</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || entryCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2B2B30] disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
              Export as CSV
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing || entryCount === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                confirmClear
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-gray-100 dark:bg-[#1F1F23] hover:bg-gray-200 dark:hover:bg-[#2B2B30] text-gray-900 dark:text-white"
              }`}
            >
              {isClearing && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmClear ? "Confirm — clear all data" : "Clear all data"}
            </button>
          </div>

          {confirmClear && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              This will permanently delete all {entryCount} usage entries and {analysisCount} AI analyses. Click again to confirm.
            </p>
          )}
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-800 dark:text-red-200 mb-4">Permanently delete your account and all associated data</p>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm">
          Delete Account
        </button>
      </div>
    </div>
  )
}

function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">{icon}</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
