"use client"

import { useActionState, useState } from "react"
import { signIn } from "@/app/auth/actions"
import Link from "next/link"
import { Eye, EyeOff, Brain, Zap, BarChart3, Leaf } from "lucide-react"

const features = [
  { icon: Zap,       label: "Instant CO₂ estimates",       desc: "Groq AI converts screen time into carbon grams in seconds." },
  { icon: Brain,     label: "AI-powered insights",          desc: "Personalised reduction tips based on your actual usage patterns." },
  { icon: BarChart3, label: "7-day activity trends",        desc: "See how your digital footprint changes day by day." },
  { icon: Leaf,      label: "Eco-impact reporting",         desc: "Download shareable reports for personal or org-level tracking." },
]

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07090F] p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/60">

          {/* ── Brand panel ──────────────────────────────────────────── */}
          <div className="relative md:w-[42%] bg-gradient-to-br from-[#091525] via-[#0D2040] to-[#153358] p-8 md:p-10 flex flex-col overflow-hidden">
            {/* Glow orbs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />

            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5 mb-10 relative z-10">
              <img src="/logo.svg" alt="" className="w-9 h-9 rounded-lg" />
              <span className="text-white font-semibold text-base tracking-tight">InvisibleWatts</span>
            </div>

            {/* Headline */}
            <div className="relative z-10 mb-10">
              <h2 className="text-[1.6rem] font-bold text-white leading-tight mb-3">
                Make the invisible<br />carbon visible.
              </h2>
              <p className="text-sm text-blue-200/55 leading-relaxed">
                Track the hidden CO₂ cost of your digital life — from streaming to scrolling.
              </p>
            </div>

            {/* Features */}
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

            {/* Bottom rule */}
            <div className="mt-auto pt-10 relative z-10">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <p className="text-xs text-blue-200/25">© {new Date().getFullYear()} InvisibleWatts</p>
            </div>
          </div>

          {/* ── Form panel ───────────────────────────────────────────── */}
          <div className="md:w-[58%] bg-[#0B0D13] p-8 sm:p-10 md:p-12 flex items-center">
            <div className="w-full max-w-sm mx-auto">

              {/* Mobile-only logo */}
              <div className="flex items-center gap-2 mb-8 md:hidden">
                <img src="/logo.svg" alt="" className="w-7 h-7 rounded-md" />
                <span className="text-white font-semibold text-sm">InvisibleWatts</span>
              </div>

              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
                <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
              </div>

              <form action={formAction} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {state?.error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-sm text-red-400">{state.error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 mt-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-px active:translate-y-0"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : "Sign In"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                    Create one free
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
