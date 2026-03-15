"use client"

import { CheckCircle, UploadCloud, FlaskConical, BarChart2, AlertCircle, Clock, Smartphone, Laptop } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

export interface TimelineEvent {
  id: string
  type: "analysis" | "upload" | "processing" | "failed_upload" | "failed_process"
  title: string
  detail: string
  tag: string
  occurred_at: string
  device_type?: string
  event_date?: string | null
  status?: "pending" | "processing" | "completed" | "failed"
  error_message?: string | null
}

const DEVICE_ICONS: Record<string, typeof Smartphone> = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Smartphone,
  desktop: Laptop,
}

export default function ActivityContent({
  events,
  isDemoMode,
}: {
  events: TimelineEvent[]
  isDemoMode?: boolean
}) {
  const getIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case "analysis":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "upload":
        return <UploadCloud className="w-5 h-5 text-blue-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      case "failed_upload":
      case "failed_process":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <UploadCloud className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusColor = (event: TimelineEvent) => {
    switch (event.type) {
      case "analysis":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300"
      case "upload":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300"
      case "processing":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-300"
      case "failed_upload":
      case "failed_process":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
      default:
        return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-900 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity</h1>
        <p className="text-gray-600 dark:text-gray-400">Your upload, processing, and analysis history</p>
      </div>

      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
          <FlaskConical className="w-4 h-4 flex-shrink-0" />
          <span>
            You&apos;re viewing <strong>demo data</strong>. Upload your device usage data to see your real activity.
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center px-4">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1F1F23]">
              <BarChart2 className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-1">No activity yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Events will appear here after you upload usage data.
              </p>
            </div>
            <Link
              href="/upload"
              className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all"
            >
              Upload Data
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(event)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(event.occurred_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Display date and time info for uploads/processing */}
                    {(event.type === "upload" || event.type === "processing" || event.type === "failed_upload" || event.type === "failed_process") && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1">
                        {event.event_date && (
                          <div>
                            📅 Date: <span className="font-medium">{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        {event.device_type && (
                          <div>
                            📱 Device: <span className="font-medium capitalize">{event.device_type}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {event.detail}
                    </p>

                    {/* Error message for failed events */}
                    {(event.type === "failed_upload" || event.type === "failed_process") && event.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900">
                        ⚠️ Error: {event.error_message}
                      </p>
                    )}

                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event)}`}
                    >
                      {event.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
