"use client"

import { User, Target, Database, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react"
import { updateProfile, updateGoals, clearUsageData } from "@/app/settings/actions"
import { createClient } from "@/lib/supabase/client"
import type { Profile, UserPreferences } from "@/lib/supabase/types"
import { useState, useTransition, useRef } from "react"

type SaveStatus = "idle" | "saving" | "saved" | "error"

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
  const profileFormRef = useRef<HTMLFormElement>(null)
  const goalsFormRef   = useRef<HTMLFormElement>(null)

  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle")
  const [goalsStatus,   setGoalsStatus]   = useState<SaveStatus>("idle")
  const [pwStatus,      setPwStatus]      = useState<SaveStatus>("idle")
  const [pwError,       setPwError]       = useState<string | null>(null)
  const [newPw,         setNewPw]         = useState("")
  const [confirmPw,     setConfirmPw]     = useState("")

  const [isExporting,  setIsExporting]       = useState(false)
  const [isClearing,   startClearTransition] = useTransition()
  const [confirmClear, setConfirmClear]      = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profileFormRef.current) return
    const formData = new FormData(profileFormRef.current)
    setProfileStatus("saving")
    try {
      await updateProfile(formData)
      setProfileStatus("saved")
      setTimeout(() => setProfileStatus("idle"), 3000)
    } catch {
      setProfileStatus("error")
    }
  }

  async function handleGoalsSave(e: React.FormEvent) {
    e.preventDefault()
    if (!goalsFormRef.current) return
    const formData = new FormData(goalsFormRef.current)
    setGoalsStatus("saving")
    try {
      await updateGoals(formData)
      setGoalsStatus("saved")
      setTimeout(() => setGoalsStatus("idle"), 3000)
    } catch {
      setGoalsStatus("error")
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return }
    setPwStatus("saving")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) {
        setPwError(error.message)
        setPwStatus("idle")
      } else {
        setPwStatus("saved")
        setNewPw(""); setConfirmPw("")
        setTimeout(() => setPwStatus("idle"), 3000)
      }
    } catch {
      setPwStatus("error")
    }
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("usage_entries")
        .select("date,device_type,daily_hours,activity_type,notes")
        .order("date", { ascending: false })
      if (!data || data.length === 0) return
      const csv = [
        "Date,Device,Hours,Activity,Notes",
        ...data.map((e) => [e.date, e.device_type, e.daily_hours, e.activity_type, e.notes ?? ""].join(",")),
      ].join("\n")
      const a = document.createElement("a")
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
      a.download = `invisiblewatts-data-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
    } finally {
      setIsExporting(false)
    }
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return }
    startClearTransition(async () => {
      await clearUsageData()
      setConfirmClear(false)
    })
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User"
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Account ──────────────────────────────────────────── */}
      <Section icon={<User className="w-4 h-4" />} title="Account" description="Your profile and login details">

        {/* Avatar strip */}
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100 dark:border-[#1F1F23]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 select-none">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email ?? "—"}</p>
          </div>
        </div>

        {/* Profile form */}
        <form ref={profileFormRef} onSubmit={handleProfileSave} className="space-y-4 pb-5 mb-5 border-b border-gray-100 dark:border-[#1F1F23]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Your name"
                className={inputCls}
              />
            </Field>
            <Field label="Email address">
              <p className="px-3.5 py-2.5 rounded-lg bg-gray-50 dark:bg-[#1A1A1F] border border-gray-200 dark:border-[#2B2B30] text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed select-none">
                {profile?.email ?? "—"}
              </p>
            </Field>
          </div>
          <SaveRow status={profileStatus} label="Save Profile" />
        </form>

        {/* Password change */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Change Password</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New password">
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className={inputCls}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                className={inputCls}
              />
            </Field>
          </div>
          {pwError && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{pwError}
            </p>
          )}
          <SaveRow status={pwStatus} label="Update Password" />
        </form>
      </Section>

      {/* ── Carbon Goals ─────────────────────────────────────── */}
      <Section icon={<Target className="w-4 h-4" />} title="Carbon Goals" description="Set personal targets to reduce your digital footprint">
        <form ref={goalsFormRef} onSubmit={handleGoalsSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Daily CO₂ target" hint="Avg: ~400 g/day per phone + laptop">
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-[#2B2B30] focus-within:ring-2 focus-within:ring-blue-500/40 transition">
                <input
                  name="daily_co2_target"
                  type="number"
                  min={0}
                  defaultValue={prefs?.daily_kwh_target ?? 500}
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-gray-50 dark:bg-[#1A1A1F] text-gray-900 dark:text-white text-sm focus:outline-none"
                />
                <span className="px-3 flex items-center bg-gray-100 dark:bg-[#2B2B30] text-gray-500 dark:text-gray-400 text-xs border-l border-gray-200 dark:border-[#2B2B30] whitespace-nowrap">
                  g CO₂/day
                </span>
              </div>
            </Field>

            <Field label="Weekly screen time goal" hint="WHO: ≤ 2–3 hrs/day recreational">
              <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-[#2B2B30] focus-within:ring-2 focus-within:ring-blue-500/40 transition">
                <input
                  name="weekly_screen_time"
                  type="number"
                  min={0}
                  defaultValue={prefs?.monthly_budget_dollars ?? 21}
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-gray-50 dark:bg-[#1A1A1F] text-gray-900 dark:text-white text-sm focus:outline-none"
                />
                <span className="px-3 flex items-center bg-gray-100 dark:bg-[#2B2B30] text-gray-500 dark:text-gray-400 text-xs border-l border-gray-200 dark:border-[#2B2B30] whitespace-nowrap">
                  hrs/week
                </span>
              </div>
            </Field>

          </div>
          <SaveRow status={goalsStatus} label="Save Goals" />
        </form>
      </Section>

      {/* ── Your Data ────────────────────────────────────────── */}
      <Section icon={<Database className="w-4 h-4" />} title="Your Data" description="Export or clear the usage data you've uploaded">
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-xl p-4 text-center border border-gray-100 dark:border-[#2B2B30]">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{entryCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usage entries</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#1A1A1F] rounded-xl p-4 text-center border border-gray-100 dark:border-[#2B2B30]">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysisCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI analyses</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || entryCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-[#2B2B30] bg-gray-50 dark:bg-[#1A1A1F] hover:bg-gray-100 dark:hover:bg-[#2B2B30] disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 dark:text-white"
            >
              {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
              Export as CSV
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing || entryCount === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border ${
                confirmClear
                  ? "bg-orange-500 hover:bg-orange-600 border-orange-600 text-white"
                  : "bg-gray-50 dark:bg-[#1A1A1F] hover:bg-gray-100 dark:hover:bg-[#2B2B30] border-gray-200 dark:border-[#2B2B30] text-gray-900 dark:text-white"
              }`}
            >
              {isClearing && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmClear ? "Confirm — clear all data" : "Clear all data"}
            </button>
          </div>

          {confirmClear && (
            <p className="flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              This will permanently delete all {entryCount} usage {entryCount === 1 ? "entry" : "entries"} and {analysisCount} AI {analysisCount === 1 ? "analysis" : "analyses"}. Click again to confirm.
            </p>
          )}
        </div>
      </Section>

      {/* ── Danger Zone ──────────────────────────────────────── */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50">
          <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Danger Zone</p>
            <p className="text-xs text-red-500 dark:text-red-400">Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="px-6 py-5 bg-white dark:bg-[#0F0F12]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Permanently remove your account and all associated data
              </p>
            </div>
            <button className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-300 dark:border-red-800 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 whitespace-nowrap">
              Delete Account
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

// ── Shared helpers ──────────────────────────────────────────────

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-gray-50 dark:bg-[#1A1A1F] border border-gray-200 dark:border-[#2B2B30] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>}
    </div>
  )
}

function SaveRow({ status, label }: { status: SaveStatus; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={status === "saving"}
        className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium transition-colors"
      >
        {status === "saving" ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{label}</span>
        ) : label}
      </button>
      {status === "saved" && (
        <span className="flex items-center gap-1.5 text-xs text-emerald-500">
          <CheckCircle2 className="w-3.5 h-3.5" />Saved
        </span>
      )}
      {status === "error" && (
        <span className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" />Failed to save
        </span>
      )}
    </div>
  )
}

function Section({
  icon, title, description, children,
}: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#1F1F23] text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}
