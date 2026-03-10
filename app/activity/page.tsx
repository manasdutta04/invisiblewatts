"use client"

import Layout from "@/components/kokonutui/layout"
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

const activityLog = [
  { id: 1, time: "Today 4:32 PM", event: "Peak Usage Detected", description: "Usage exceeded 3 kW for 15 minutes", type: "alert", device: "HVAC System" },
  { id: 2, time: "Today 2:15 PM", event: "Device Connected", description: "Smart meter successfully synchronized", type: "success", device: "Smart Meter" },
  { id: 3, time: "Today 10:00 AM", event: "Energy Goal Met", description: "Daily usage 8% below target", type: "success", device: "System" },
  { id: 4, time: "Yesterday 6:45 PM", event: "Unusual Pattern", description: "Usage pattern differs from usual by 12%", type: "warning", device: "Water Heater" },
  { id: 5, time: "Yesterday 2:30 PM", event: "Device Offline", description: "Connection lost with smart plug", type: "alert", device: "Smart Plug #3" },
  { id: 6, time: "Yesterday 1:00 PM", event: "Maintenance Alert", description: "Scheduled maintenance completed", type: "info", device: "System" },
  { id: 7, time: "Mar 8, 10:15 AM", event: "Settings Updated", description: "Energy targets adjusted", type: "info", device: "System" },
  { id: 8, time: "Mar 7, 4:00 PM", event: "Report Generated", description: "Monthly energy report available", type: "success", device: "System" },
]

export default function ActivityPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity Log</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor all system events and alerts</p>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
          <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
            {activityLog.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ActivityItem({ activity }: { activity: (typeof activityLog)[0] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900"
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900"
      case "info":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900"
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    }
  }

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getIcon(activity.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{activity.event}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{activity.time}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getEventColor(activity.type)}`}>
            {activity.device}
          </div>
        </div>
      </div>
    </div>
  )
}
