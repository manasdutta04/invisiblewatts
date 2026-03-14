"use client"

import { useActionState } from "react"
import { forgotPassword } from "@/app/auth/actions"
import Link from "next/link"
import { Zap, Brain, BarChart3, Leaf, ArrowLeft } from "lucide-react"

const features = [
  { icon: Zap,       label: "Instant CO₂ estimates",  desc: "Advanced AI analysis converts screen time into carbon grams in seconds." },
  { icon: Brain,     label: "AI-powered insights",     desc: "Personalised reduction tips based on your actual usage patterns." },
  { icon: BarChart3, label: "7-day activity trends",   desc: "See how your digital footprint changes day by day." },
  { icon: Leaf,      label: "Eco-impact reporting",    desc: "Download shareable reports for personal or org-level tracking." },
]

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null)
  const success = state && "success" in state ? state.success : null
  const error   = state && "error"   in state ? state.error   : null

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
            <div className="max-w-sm mx-auto w-full">

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-8"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </Link>

              <h1 className="text-2xl font-bold text-white mb-1">Forgot your password?</h1>
              <p className="text-sm text-gray-400 mb-8">
                Enter your account email and we'll send you a reset link.
              </p>

              {success ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
                  <p className="text-sm font-medium text-emerald-400 mb-1">Email sent!</p>
                  <p className="text-xs text-emerald-300/70">{success}</p>
                  <Link
                    href="/login"
                    className="mt-4 inline-block text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-2"
                  >
                    Return to sign in
                  </Link>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="relative w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 text-white text-sm font-semibold transition-all overflow-hidden"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending…
                      </span>
                    ) : "Send reset link"}
                  </button>
                </form>
              )}

              <p className="text-center text-xs text-gray-600 mt-8">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
