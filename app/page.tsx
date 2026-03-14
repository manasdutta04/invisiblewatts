import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  Zap, BarChart3, Brain, Upload, ShieldCheck, Leaf,
  Chrome, ArrowRight, Check,
} from "lucide-react"
import LandingNavbar from "@/components/landing-navbar"

// ─── Static data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: "AI CO₂ Analysis",
    desc: "Groq AI processes your screen time data and calculates precise carbon grams — per app, per device, per day.",
    accent: "blue",
  },
  {
    icon: Upload,
    title: "Screenshot Upload",
    desc: "Drag in an iOS Screen Time or Android Digital Wellbeing screenshot. AI extracts everything automatically.",
    accent: "cyan",
  },
  {
    icon: BarChart3,
    title: "7-Day Trends",
    desc: "Track your digital footprint over time with interactive charts. Spot your heaviest-impact days at a glance.",
    accent: "violet",
  },
  {
    icon: Leaf,
    title: "Reduction Tips",
    desc: "Tailored AI recommendations — from switching to dark mode to limiting streaming resolution.",
    accent: "emerald",
  },
  {
    icon: Chrome,
    title: "Chrome Extension",
    desc: "Passive background tracking in your browser. Estimates CO₂ per site visited with no manual input.",
    accent: "orange",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-First",
    desc: "Uploaded images are never stored. Only the extracted usage data hits our database.",
    accent: "blue",
  },
]

const steps = [
  {
    n: "01",
    title: "Upload or enter data",
    desc: "Drop in a screen time screenshot or manually enter device type, hours, and activity.",
  },
  {
    n: "02",
    title: "AI extracts & calculates",
    desc: "Groq's vision and language models read your data, calculate CO₂ grams, and generate insights.",
  },
  {
    n: "03",
    title: "Reduce your footprint",
    desc: "Get a ranked list of changes that will cut the most carbon from your digital routine.",
  },
]

const accentCls: Record<string, string> = {
  blue:    "bg-blue-500/10    text-blue-400    border-blue-500/20",
  cyan:    "bg-cyan-500/10    text-cyan-400    border-cyan-500/20",
  violet:  "bg-violet-500/10  text-violet-400  border-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  orange:  "bg-orange-500/10  text-orange-400  border-orange-500/20",
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const bars = [42, 67, 55, 88, 71, 95, 63]
  const days = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="relative select-none">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 blur-3xl rounded-3xl" />

      {/* Main card */}
      <div className="relative rounded-2xl border border-white/[0.09] bg-[#0B0D14] shadow-2xl overflow-hidden">
        {/* Fake browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <div className="ml-3 flex-1 max-w-[160px] rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-0.5">
            <span className="text-[9px] text-gray-600">invisiblewatts.app/dashboard</span>
          </div>
        </div>

        <div className="p-4">
          {/* Metric row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Weekly CO₂", value: "2.4", unit: "kg", change: "−18% vs last week", good: true, color: "text-emerald-400" },
              { label: "Today",      value: "38",  unit: "g",  change: "+4g so far",        good: false, color: "text-blue-400" },
              { label: "Screen time",value: "6.2", unit: "h",  change: "daily average",     good: true,  color: "text-violet-400" },
            ].map(m => (
              <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5">
                <p className="text-[9px] text-gray-500 mb-1">{m.label}</p>
                <p className={`text-base font-bold leading-none ${m.color}`}>
                  {m.value}
                  <span className="text-[9px] font-normal text-gray-500 ml-0.5">{m.unit}</span>
                </p>
                <p className={`text-[8px] mt-1 ${m.good ? "text-emerald-500" : "text-amber-500"}`}>{m.change}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 mb-3">
            <p className="text-[9px] text-gray-500 mb-2.5">Daily CO₂ this week</p>
            <div className="flex items-end gap-1.5 h-14">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: i === 5
                        ? "linear-gradient(to top, #3b82f6, #06b6d4)"
                        : "rgba(59,130,246,0.25)",
                    }}
                  />
                  <span className="text-[7px] text-gray-600">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI insight strip */}
          <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 px-3 py-2 flex items-start gap-2">
            <Zap className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-[9px] text-emerald-300/80 leading-relaxed">
              <span className="font-semibold">AI insight:</span> Streaming accounts for 61% of your weekly CO₂.
              Reducing HD usage by 1h/day could save <span className="font-semibold">28g</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Floating: activity breakdown */}
      <div className="absolute -right-8 top-1/3 rounded-xl border border-white/[0.09] bg-[#0D1017]/95 backdrop-blur px-3 py-2.5 shadow-xl w-36">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-2">Top activities</p>
        {[
          { label: "Streaming", pct: 61, color: "bg-red-400" },
          { label: "Browsing",  pct: 24, color: "bg-blue-400" },
          { label: "Gaming",    pct: 15, color: "bg-orange-400" },
        ].map(a => (
          <div key={a.label} className="flex items-center gap-1.5 mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.color}`} />
            <span className="text-[9px] text-gray-400 flex-1">{a.label}</span>
            <span className="text-[9px] text-gray-500 font-medium">{a.pct}%</span>
          </div>
        ))}
      </div>

      {/* Floating: AI tips */}
      <div className="absolute -left-6 bottom-6 rounded-xl border border-white/[0.09] bg-[#0D1017]/95 backdrop-blur px-3 py-2.5 shadow-xl w-34">
        <p className="text-[8px] text-gray-500 mb-2">AI suggestions</p>
        {["Lower resolution", "Use Wi-Fi not 4G", "Dark mode"].map(t => (
          <div key={t} className="flex items-center gap-1.5 mb-1.5">
            <Check className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
            <span className="text-[9px] text-gray-400">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Extension Mockup ─────────────────────────────────────────────────────────

function ExtensionMockup() {
  return (
    <div className="relative flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-500/10 blur-2xl" />
      <div className="relative w-52 rounded-2xl border border-white/[0.10] bg-[#0F1117] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0A1525] to-[#0D1E35] px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
          <img src="/logo.svg" alt="" className="w-5 h-5 rounded-md" />
          <span className="text-xs font-semibold text-white">InvisibleWatts</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
        </div>
        <div className="p-4">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Today's footprint</p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-3xl font-bold text-white">127</span>
            <span className="text-xs text-gray-500 mb-1">g CO₂</span>
          </div>
          {/* Ring meter */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a1f2e" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="url(#ringGrad)" strokeWidth="3.5"
                strokeDasharray="63 37" strokeLinecap="round"
              />
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-400">63%</span>
          </div>
          {/* Site list */}
          <div className="space-y-2">
            {[
              { site: "youtube.com", co2: "68g", color: "bg-red-400" },
              { site: "github.com",  co2: "12g", color: "bg-blue-400" },
              { site: "twitter.com", co2: "9g",  color: "bg-sky-400" },
            ].map(s => (
              <div key={s.site} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                  <span className="text-[9px] text-gray-400">{s.site}</span>
                </div>
                <span className="text-[9px] text-gray-500 font-medium">{s.co2}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  const year = new Date().getFullYear()

  return (
    <div className="bg-[#07090F] min-h-screen text-white antialiased overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <LandingNavbar />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/3 w-[700px] h-[500px] rounded-full bg-blue-600/7 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] rounded-full bg-cyan-500/6 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-emerald-500/4 blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs text-blue-300 mb-6">
                <Zap className="w-3 h-3" />
                Powered by Groq AI · Free to use
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight mb-5">
                Make the invisible<br />carbon{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    visible.
                  </span>
                </span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-[420px]">
                Every stream, scroll, and search has a carbon cost. InvisibleWatts
                quantifies it — then helps you cut it.
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-px active:translate-y-0"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 font-medium px-6 py-3 rounded-xl transition-all"
                >
                  Sign in
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-5 text-xs text-gray-500">
                {["Free forever", "No credit card", "Open source"].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="hidden md:block relative py-8 pl-8 pr-12">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "400g",  label: "CO₂/hr streaming HD",      color: "text-red-400" },
            { value: "4g",    label: "CO₂/hr browsing the web",   color: "text-blue-400" },
            { value: "~2 kg", label: "avg. weekly digital output", color: "text-amber-400" },
            { value: "60%",   label: "reducible with small habit changes", color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-3xl font-bold mb-1.5 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              From screenshot to insight<br />in three steps
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              No complex setup. No integrations. Upload your data and let AI do the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 relative">
            {/* Connector line desktop */}
            <div className="hidden md:block absolute top-9 left-[calc(33%-8px)] right-[calc(33%-8px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {steps.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/25 flex items-center justify-center mb-5">
                  <span className="text-sm font-bold text-blue-300">{s.n}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to<br />track digital carbon
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              Built for individuals and sustainability-conscious teams.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${accentCls[f.accent]}`}>
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Extension section ──────────────────────────────────────── */}
      <section id="extension" className="py-28 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0B1220] to-[#0D1525] overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">

              {/* Copy */}
              <div className="p-8 sm:p-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300 mb-6">
                  <Chrome className="w-3 h-3" />
                  Chrome Extension — MV3
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Passive tracking.<br />Zero effort.
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Install the InvisibleWatts Chrome extension and it runs silently in the
                  background — estimating CO₂ per site, per minute, with no manual input.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "40+ built-in site carbon profiles",
                    "7-day local analytics dashboard",
                    "Real-time video detection for streaming",
                    "All data stays on your device",
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                >
                  <Chrome className="w-4 h-4" />
                  Load in Chrome (developer mode)
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Extension popup preview */}
              <div className="hidden md:block">
                <ExtensionMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0B1525] via-[#0D1E35] to-[#091525] py-16 px-8 sm:px-16 text-center overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/12 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 right-1/4 w-60 h-60 bg-emerald-500/8 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-300 mb-6">
                <Leaf className="w-3 h-3" />
                Free forever · No credit card required
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Start reducing your<br />digital carbon today.
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                Upload your first screen time report, get your CO₂ breakdown in seconds,
                and see exactly where to cut back.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-px text-sm"
                >
                  Create your free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white font-medium px-6 py-3.5 rounded-xl transition-all text-sm"
                >
                  Already have an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6 rounded-md" />
            <span className="text-sm text-gray-500 font-medium">InvisibleWatts</span>
          </div>
          <p className="text-xs text-gray-600">
            © {year} InvisibleWatts · Making digital carbon visible.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/help"  className="hover:text-gray-300 transition-colors">Help</Link>
            <Link href="/login" className="hover:text-gray-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
