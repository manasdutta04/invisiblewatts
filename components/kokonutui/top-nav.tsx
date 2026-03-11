"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronRight } from "lucide-react"
import Profile01 from "./profile-01"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { memo, useMemo, useState, useEffect } from "react"
import NotificationsModal from "@/components/notifications-modal"
import { createClient } from "@/lib/supabase/client"

interface BreadcrumbItem {
  label: string
  href?: string
}

const TopNav = memo(({ breadcrumbs }: { breadcrumbs?: BreadcrumbItem[] }) => {
  const pathname = usePathname()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? "")
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserName(
              profile?.full_name ?? data.user?.email?.split("@")[0] ?? "User"
            )
          })
      }
    })
  }, [])

  const getPageLabel = (path: string): string => {
    switch (path) {
      case "/dashboard": return "Dashboard"
      case "/upload": return "Upload Data"
      case "/activity": return "Activity"
      case "/analytics": return "Analytics"
      case "/reports": return "Reports"
      case "/ai-insights": return "AI Insights"
      case "/settings": return "Settings"
      case "/help": return "Help & Support"
      case "/terms": return "Terms of Service"
      default: return "Dashboard"
    }
  }

  const defaultBreadcrumbs = useMemo(
    () =>
      breadcrumbs || [
        { label: "InvisibleWatts", href: "/dashboard" },
        { label: getPageLabel(pathname), href: pathname },
      ],
    [pathname, breadcrumbs]
  )

  const initials = userName ? userName.slice(0, 2).toUpperCase() : "IW"

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        {defaultBreadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <NotificationsModal open={notificationsOpen} onOpenChange={setNotificationsOpen} />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center cursor-pointer">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 name={userName || "User"} email={userEmail} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
})

TopNav.displayName = "TopNav"

export default TopNav
