"use client"

import { Bell, Lock, User, Zap } from "lucide-react"
import { updateProfile, updateGoals, updateNotifications } from "@/app/settings/actions"
import type { Profile, UserPreferences } from "@/lib/supabase/types"

interface NotificationPrefs {
  peak_usage?: boolean
  daily_summary?: boolean
  weekly_report?: boolean
  device_offline?: boolean
  maintenance?: boolean
}

export default function SettingsContent({
  profile,
  prefs,
}: {
  profile: Profile | null
  prefs: UserPreferences | null
}) {
  const notifs = (prefs?.notifications ?? {}) as NotificationPrefs

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <SettingSection icon={<User className="w-5 h-5" />} title="Account" description="Personal information and profile">
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Full Name</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <SettingItem label="Email" value={profile?.email ?? "—"} />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Name
          </button>
        </form>
      </SettingSection>

      {/* Energy Goals */}
      <SettingSection icon={<Zap className="w-5 h-5" />} title="Energy Goals" description="Set and manage your energy consumption targets">
        <form action={updateGoals} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Daily Usage Target</label>
            <div className="flex items-center gap-2">
              <input
                name="daily_kwh_target"
                type="number"
                defaultValue={prefs?.daily_kwh_target ?? 60}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">kWh per day</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Monthly Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">$</span>
              <input
                name="monthly_budget_dollars"
                type="number"
                defaultValue={prefs?.monthly_budget_dollars ?? 300}
                className="w-32 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Goals
          </button>
        </form>
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={<Bell className="w-5 h-5" />} title="Notifications" description="Control how and when you receive alerts">
        <form action={updateNotifications} className="space-y-4">
          {[
            { key: "peak_usage", label: "Peak Usage Alerts", description: "Notify when usage exceeds threshold", defaultValue: notifs.peak_usage ?? true },
            { key: "daily_summary", label: "Daily Summary", description: "Daily energy consumption report", defaultValue: notifs.daily_summary ?? true },
            { key: "weekly_report", label: "Weekly Report", description: "Weekly energy analysis", defaultValue: notifs.weekly_report ?? false },
            { key: "device_offline", label: "Device Offline", description: "Alert when device goes offline", defaultValue: notifs.device_offline ?? true },
            { key: "maintenance", label: "Maintenance Reminders", description: "System maintenance notifications", defaultValue: notifs.maintenance ?? false },
          ].map((notif) => (
            <label key={notif.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={notif.key}
                defaultChecked={notif.defaultValue}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{notif.description}</p>
              </div>
            </label>
          ))}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Save Notifications
          </button>
        </form>
      </SettingSection>

      {/* Security */}
      <SettingSection icon={<Lock className="w-5 h-5" />} title="Security" description="Manage your account security">
        <div className="space-y-3">
          <button className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-[#1F1F23] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition-colors">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your password</p>
          </button>
          <button className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-[#1F1F23] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition-colors">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enhance account security</p>
          </button>
        </div>
      </SettingSection>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-800 dark:text-red-200 mb-4">Irreversible actions</p>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}

function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">{icon}</div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#1F1F23] last:border-b-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
    </div>
  )
}
