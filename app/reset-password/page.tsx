"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck, Zap, Brain, BarChart3, Leaf } from "lucide-react"
import { Suspense } from "react"

const features = [
  { icon: Zap,          label: "Instant CO₂ estimates",  desc: "Groq AI converts screen time into carbon grams in seconds." },
  { icon: Brain,        label: "AI-powered insights",     desc: "Personalised reduction tips based on your actual usage patterns." },
  { icon: BarChart3,    label: "7-day activity trends",   desc: "See how your digital footprint changes day by day." },
  { icon: Leaf,         label: "Eco-impact reporting",    desc: "Download shareable reports for personal or org-level tracking." },
]

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword]         = useState("")
  const [confirm, setConfirm]           = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isPending, setIsPending]       = useState(false)
  const [error,  setError]              = useState<string | null>(null)
  const [ready, setReady]               = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Exchange the recovery code for a session as soon as the page loads
  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) {
      setSessionError("Invalid or expired reset link. Please request a new one.")
      return
    }
    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setSessionError("Invalid or expired reset link. Please request a new one.")
      } else {
        setReady(true)
      }
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setIsPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <div className="flex items-center gap-2.5 mb-8 md:hidden">
        <img src="/logo.svg" alt="" className="w-8 h-8 rounded-lg" />
        <span className="text-white font-semibold text-sm">InvisibleWatts</span>
      </div>

      <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
        <ShieldCheck className="w-5 h-5 text-blue-400" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">Create new password</h1>
      <p className="text-sm text-gray-400 mb-8">
        Your new password must be at least 6 characters.
      </p>

      {sessionError ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-5 text-center">
          <p className="text-sm text-red-400 mb-4">{sessionError}</p>
          <Link
            href="/forgot-password"
            className="inline-block px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Request new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !ready}
            className="relative w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 text-white text-sm font-semibold transition-all overflow-hidden"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Updating…
              </span>
            ) : !ready && !sessionError ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Verifying link…
              </span>
            ) : "Set new password"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-600 mt-8">
        Remembered it?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090F] p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/60">

          {/* ── Brand panel ─────────────────────────────────────────── */}
          <div className="relative md:w-[42%] bg-gradient-to-br from-[#091525] via-[#0D2040] to-[#153358] p-8 md:p-10 flex flex-col overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-10 relative z-10">
              <img src="/logo.svg" alt="" className="w-9 h-9 rounded-lg" />
              <span className="text-white font-semibold text-base tracking-tight">InvisibleWatts</span>
            </div>

            <div className="relative z-10 mb-10">
              <h2 className="text-[1.6rem] font-bold text-white leading-tight mb-3">
                Make the invisible<br />carbon visible.
              </h2>
              <p className="text-sm text-blue-200/55 leading-relaxed">
                Track the hidden CO₂ cost of your digital life — from streaming to scrolling.
              </p>
            </div>

            <ul className="space-y-4 relative z-10">
              {features.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-blue-500/12 border border-blue-400/20 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-100/80">{label}</p>
                    <p className="text-xs text-blue-200/40 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Form panel ──────────────────────────────────────────── */}
          <div className="flex-1 bg-[#0B0D13] p-8 md:p-10 flex flex-col justify-center">
            <Suspense fallback={
              <div className="max-w-sm mx-auto w-full flex items-center justify-center py-16">
                <span className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  )
}
