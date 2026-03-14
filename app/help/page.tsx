"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import Layout from "@/components/kokonutui/layout"

const helpSections = [
  {
    title: "Getting Started",
    items: [
      {
        question: "What is InvisibleWatts?",
        answer:
          "InvisibleWatts is a digital carbon tracker that quantifies the CO₂ emissions from your screen time and device usage. You upload a screenshot of your phone or laptop's screen time report (iOS Screen Time, Android Digital Wellbeing, or Windows) or manually enter your device usage, and our AI calculates the carbon footprint of your digital habits.",
      },
      {
        question: "How do I get started?",
        answer:
          "Sign up for a free account, then head to the Upload Data page. You can either drag and drop a screenshot of your screen time report or manually add entries by selecting a device, entering daily hours, and choosing an activity type (streaming, browsing, gaming, etc.). Once saved, your dashboard and analytics pages will populate with real data.",
      },
      {
        question: "What screen time formats are supported?",
        answer:
          "The AI extraction supports screenshots from iOS Screen Time (Settings → Screen Time), Android Digital Wellbeing (Settings → Digital Wellbeing), and Windows screen time summaries. For best results, use a clear, full-screen capture. If extraction misses something, you can always edit the detected entries before saving.",
      },
    ],
  },
  {
    title: "Understanding Your Data",
    items: [
      {
        question: "How are CO₂ emissions calculated?",
        answer:
          "Emissions are estimated using per-device emission factors (phone: 0.4 gCO₂/hour, laptop: 10 gCO₂/hour, tablet: 3 gCO₂/hour) combined with activity multipliers (streaming ×3, gaming ×2, calls ×1.5, mixed ×1.2, browsing ×1). These are multiplied by your daily hours to produce a gCO₂eq estimate. The AI model then cross-checks and contextualises the result.",
      },
      {
        question: "What do the AI recommendations mean?",
        answer:
          "After each analysis, Groq AI reviews your usage entries and generates personalised recommendations to reduce your digital carbon footprint — for example switching to audio-only calls, reducing background streaming, or batching downloads to off-peak hours. Each recommendation is saved and visible on the AI Insights and Reports pages.",
      },
      {
        question: "How accurate are the CO₂ estimates?",
        answer:
          "These are approximations based on global average grid emission factors (~400 gCO₂/kWh) and typical device wattages. Actual emissions vary by region, device model, network type, and data centre efficiency. Think of the numbers as directional indicators rather than precise measurements — they're useful for tracking trends and comparing activities over time.",
      },
      {
        question: "What is Demo Mode?",
        answer:
          "Demo Mode overlays pre-loaded sample data on every page so you can explore the full UI without uploading anything. Toggle it on or off using the Demo button at the bottom of the sidebar. When active, an amber banner appears on each page to remind you that you're viewing demo data.",
      },
    ],
  },
  {
    title: "Uploading & Privacy",
    items: [
      {
        question: "Is my screenshot stored on your servers?",
        answer:
          "No. Uploaded images are read locally in your browser and converted to base64, then sent directly to the AI extraction API. Only the extracted text data (device type, hours, activity) is saved to the database — the image itself is never stored anywhere.",
      },
      {
        question: "What happens if the AI extracts incorrect data?",
        answer:
          "After extraction, you'll see a table of detected entries before anything is saved. You can edit, remove, or add rows to correct any mistakes. Only when you click 'Save' or 'Analyse with AI' is the data written to your account.",
      },
      {
        question: "Can I delete my data?",
        answer:
          "Yes. You can delete individual usage entries from the Activity page. Full account deletion (which removes all your data permanently) is available in Settings → Danger Zone. This action cannot be undone.",
      },
    ],
  },
  {
    title: "Account & Access",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "On the login page, click 'Forgot password?' and enter your email address. Supabase will send you a password reset link. Follow the link in the email to set a new password. If you don't receive the email, check your spam folder.",
      },
      {
        question: "Is InvisibleWatts free?",
        answer:
          "InvisibleWatts is currently in public beta and free to use. All core features — screenshot upload, AI analysis, dashboard, analytics, and reports — are available at no cost during the beta period.",
      },
      {
        question: "Which browsers and devices are supported?",
        answer:
          "The web app works on any modern browser (Chrome, Firefox, Safari, Edge). The Chrome extension is available for Chromium-based browsers (Chrome, Brave, Edge). No mobile app is required — the web app is fully responsive.",
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Find answers to common questions about tracking your digital carbon footprint.
        </p>
      </div>

      <div className="space-y-8">
        {helpSections.map((section) => (
          <div key={section.title} className="border-b border-gray-200 dark:border-[#2B2B30] pb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <details
                  key={index}
                  className="group cursor-pointer border border-gray-200 dark:border-[#2B2B30] rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
                >
                  <summary className="flex items-start justify-between font-semibold text-gray-900 dark:text-white">
                    <span className="text-left">{item.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Can't find the answer you're looking for? Raise an issue on GitHub and the team will get back to you.
        </p>
        <Link
          href="https://github.com/manasdutta04/invisiblewatts/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Raise an Issue
        </Link>
      </div>
      </div>
    </Layout>
  )
}
