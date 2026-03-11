"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useState } from "react"

interface Notification {
  id: string
  type: "alert" | "success" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NotificationsModal({
  open,
  onOpenChange,
}: NotificationsModalProps) {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "High Energy Usage",
      message: "Your HVAC system is consuming 23% more energy than normal.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Maintenance Scheduled",
      message: "Your HVAC maintenance has been successfully scheduled for March 15.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Weather Update",
      message: "Cooler temperatures expected tomorrow - your cooling costs may decrease.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "4",
      type: "info",
      title: "Peak Hours Alert",
      message: "Peak usage hours are 4 PM - 8 PM. Consider shifting loads.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
    },
  ])

  const getIconByType = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60))
      return `${mins}m ago`
    }
    if (hours < 24) {
      return `${hours}h ago`
    }
    if (days === 1) {
      return "Yesterday"
    }
    return `${days}d ago`
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  notification.read
                    ? "bg-gray-50 dark:bg-[#1F1F23] border-gray-200 dark:border-[#2B2B30]"
                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
