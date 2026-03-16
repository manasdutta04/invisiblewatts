"use client"

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Save,
  ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { UsageEntryInput } from "@/lib/supabase/types"

import ManualTracker from "./manual-tracker"

const DEVICE_TYPES = ["phone", "laptop", "tablet", "desktop", "smart_tv", "console", "smartwatch"] as const
const DEVICE_LABELS: Record<typeof DEVICE_TYPES[number], string> = {
  phone: "Phone",
  laptop: "Laptop",
  tablet: "Tablet",
  desktop: "Desktop",
  smart_tv: "Smart TV",
  console: "Console",
  smartwatch: "Smartwatch",
}
const ACTIVITY_TYPES = ["streaming", "browsing", "social", "gaming", "calls", "productivity", "mixed"] as const

type DeviceType = typeof DEVICE_TYPES[number]
type ActivityType = typeof ACTIVITY_TYPES[number]
type TimeUnit = "hr" | "min"

interface ManualRow {
  id: string
  date: string
  device_type: DeviceType
  daily_hours: string
  time_unit: TimeUnit
  activity_type: ActivityType
  notes: string
}

function newRow(): ManualRow {
  return {
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString().slice(0, 10),
    device_type: "phone",
    daily_hours: "",
    time_unit: "hr",
    activity_type: "mixed",
    notes: "",
  }
}

export default function UploadContent({ existingEntryCount }: { existingEntryCount: number }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [rows, setRows] = useState<ManualRow[]>([newRow()])
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [extractedEntries, setExtractedEntries] = useState<UsageEntryInput[]>([])
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text })
    setTimeout(() => setToast(null), 5000)
  }

  // ─── File handling ──────────────────────────────────────────────────────────

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      showToast("error", "Only image files are supported (JPG, PNG, WEBP)")
      return
    }
    setCurrentFileName(file.name)
    setIsExtracting(true)
    setExtractedEntries([])

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      const [header, imageBase64] = dataUrl.split(",")
      const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/jpeg"

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "image", imageBase64, mimeType }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Extraction failed")

        const entries: UsageEntryInput[] = data.entries ?? []
        if (entries.length === 0) {
          showToast("error", "Couldn't extract data. Try iOS Screen Time, Android Digital Wellbeing, or Windows Power & Battery screenshots.")
        } else {
          setExtractedEntries(entries)
        }
      } catch (err: any) {
        showToast("error", err.message ?? "Image extraction failed")
      } finally {
        setIsExtracting(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  // ─── DB save helpers ────────────────────────────────────────────────────────

  async function saveEntriesToDb(entries: UsageEntryInput[]) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast("error", "Not authenticated"); return false }

    const rows = entries.map((e) => ({ ...e, user_id: user.id }))
    const { error } = await supabase.from("usage_entries").insert(rows)
    if (error) { showToast("error", error.message); return false }
    return true
  }

  async function saveExtracted() {
    if (!extractedEntries.length) return
    setIsSaving(true)
    const ok = await saveEntriesToDb(extractedEntries)
    setIsSaving(false)
    if (ok) {
      showToast("success", `${extractedEntries.length} entries saved.`)
      setExtractedEntries([])
      setCurrentFileName(null)
      router.refresh()
    }
  }

  // ─── Manual row helpers ─────────────────────────────────────────────────────

  function updateRow(id: string, field: keyof ManualRow, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }

  function validRows(): UsageEntryInput[] {
    return rows
      .filter((r) => r.date && Number(r.daily_hours) > 0)
      .map((r) => {
        const hours = r.time_unit === "min"
          ? Math.round((Number(r.daily_hours) / 60) * 10) / 10
          : Number(r.daily_hours)
        return {
          date: r.date,
          device_type: r.device_type,
          daily_hours: hours,
          activity_type: r.activity_type,
          notes: r.notes || undefined,
        }
      })
  }

  async function handleSaveOnly() {
    const entries = validRows()
    if (!entries.length) { showToast("error", "Add at least one valid row (date + hours)"); return }
    setIsSaving(true)
    const ok = await saveEntriesToDb(entries)
    setIsSaving(false)
    if (ok) {
      showToast("success", `${entries.length} entries saved.`)
      setRows([newRow()])
      router.refresh()
    }
  }

  async function handleAnalyze() {
    const entries = validRows()
    if (!entries.length) { showToast("error", "Add at least one valid row (date + hours)"); return }

    // First save entries, then run AI
    setIsAnalyzing(true)
    const ok = await saveEntriesToDb(entries)
    if (!ok) { setIsAnalyzing(false); return }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "analyze", entries }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Analysis failed")

      showToast("success", "AI analysis complete! Redirecting to insights…")
      setRows([newRow()])
      setTimeout(() => router.push("/ai-insights"), 1200)
    } catch (err: any) {
      showToast("error", err.message ?? "AI analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Usage Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a screen time screenshot or enter your device usage manually. AI will calculate your digital carbon footprint.
        </p>
        {existingEntryCount > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You have {existingEntryCount} existing {existingEntryCount === 1 ? "entry" : "entries"} in your account.
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm border ${
            toast.type === "success"
              ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Panel A: File Upload ── */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Upload Screenshot
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Screenshot your iOS Screen Time, Android Digital Wellbeing, or Windows Screen Time report and upload it here. AI will extract the data automatically.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-[#2B2B30] hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {isExtracting ? (
              <>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Extracting data with AI…
                </p>
                <p className="text-xs text-gray-400">{currentFileName}</p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
                  <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drop image here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                </div>
              </>
            )}
          </div>

          {/* Extracted entries confirmation */}
          {extractedEntries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {extractedEntries.length} {extractedEntries.length === 1 ? "entry" : "entries"} extracted
                </p>
              </div>
              <div className="space-y-2">
                {extractedEntries.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#1F1F23] text-gray-700 dark:text-gray-300"
                  >
                    <span>{e.date}</span>
                    <span className="capitalize">{e.device_type}</span>
                    <span>{e.daily_hours}h</span>
                    <span className="capitalize">{e.activity_type}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveExtracted}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save {extractedEntries.length} {extractedEntries.length === 1 ? "Entry" : "Entries"}
                </button>
                <button
                  onClick={() => { setExtractedEntries([]); setCurrentFileName(null) }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2B2B30] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F23] text-sm transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel B: Manual Entry ── */}
        <ManualTracker isDemoMode={false} />
      </div>
    </div>
  )
}
