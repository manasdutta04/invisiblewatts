"use client"

import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ActivityEvent } from "@/lib/supabase/types"

const CATEGORY_COLORS: Record<string, string> = {
  HVAC: "#0ea5e9",
  "Water Heating": "#f97316",
  Lighting: "#fbbf24",
  Appliances: "#06b6d4",
}

export default function ActivityContent({
  events,
}: {
  events: ActivityEvent[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Activity Log
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor all system events and alerts
        </p>
      </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No activity events yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
            {events.map((event) => (
              <ActivityItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900"
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900"
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900"
    }
  }

  const timeAgo = formatDistanceToNow(new Date(event.occurred_at), {
    addSuffix: true,
  })

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getIcon(event.event_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {event.event_name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {event.description}
          </p>
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor(event.event_type)}`}
          >
            {event.device_name}
          </div>
        </div>
      </div>
    </div>
  )
}
