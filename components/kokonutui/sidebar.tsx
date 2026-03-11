"use client"

import {
  Home,
  Activity,
  TrendingUp,
  FileText,
  Zap,
  Settings,
  HelpCircle,
  Menu,
  FlaskConical,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useState, memo, useCallback, useEffect, useTransition } from "react"
import { toggleDemoMode } from "@/app/demo/actions"

const Sidebar = memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setIsDemoMode(document.cookie.includes("iw_demo_mode=1"))
  }, [])

  const handleNavigation = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  function handleDemoToggle() {
    startTransition(async () => {
      await toggleDemoMode()
      setIsDemoMode((prev) => !prev)
    })
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    return (
      <Link
        href={href}
        onClick={(e) => {
          handleNavigation()
          if ('startViewTransition' in document) {
            (document as any).startViewTransition(() => {})
          }
        }}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
        <Link
          href="/dashboard"
          className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
        >
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="InvisibleWatts Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
              InvisibleWatts
            </span>
          </div>
        </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Main
                </div>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/upload" icon={Upload}>
                    Upload Data
                  </NavItem>
                  <NavItem href="/activity" icon={Activity}>
                    Activity
                  </NavItem>
                  <NavItem href="/analytics" icon={TrendingUp}>
                    Analytics
                  </NavItem>
                  <NavItem href="/reports" icon={FileText}>
                    Reports
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  AI & Insights
                </div>
                <div className="space-y-1">
                  <NavItem href="/ai-insights" icon={Zap}>
                    AI Insights
                  </NavItem>
                </div>
              </div>

              {/* Demo Mode toggle */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Demo
                </div>
                <button
                  type="button"
                  onClick={handleDemoToggle}
                  disabled={isPending}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    isDemoMode
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
                  } disabled:opacity-60`}
                >
                  <FlaskConical className="h-4 w-4 mr-3 flex-shrink-0" />
                  {isPending ? "Switching…" : isDemoMode ? "Demo Mode: On" : "Try Demo"}
                  {isDemoMode && (
                    <span className="ml-auto text-xs bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full">
                      ON
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="/settings" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="/help" icon={HelpCircle}>
                Help & Support
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
})

Sidebar.displayName = "Sidebar"

export default Sidebar
