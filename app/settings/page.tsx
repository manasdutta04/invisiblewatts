"use client"

import Layout from "@/components/kokonutui/layout"
import { Bell, Lock, User, Zap, Home } from "lucide-react"

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
        </div>

        {/* Account Settings */}
        <SettingSection icon={<User className="w-5 h-5" />} title="Account" description="Personal information and profile">
          <SettingItem label="Full Name" value="John Anderson" />
          <SettingItem label="Email" value="john@example.com" />
          <SettingItem label="Phone" value="+1 (555) 123-4567" action="Update" />
          <SettingItem label="Address" value="123 Main St, Springfield, IL 62701" />
        </SettingSection>

        {/* Energy Settings */}
        <SettingSection icon={<Zap className="w-5 h-5" />} title="Energy Goals" description="Set and manage your energy consumption targets">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Daily Usage Target</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue="60" className="w-24 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-600 dark:text-gray-400">kWh per day</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Monthly Budget</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <input type="number" defaultValue="300" className="flex-1 px-3 py-2 border border-gray-300 dark:border-[#1F1F23] rounded-lg bg-white dark:bg-[#1F1F23] text-gray-900 dark:text-white" />
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
              Save Goals
            </button>
          </div>
        </SettingSection>

        {/* Device Management */}
        <SettingSection icon={<Home className="w-5 h-5" />} title="Connected Devices" description="Manage smart meters and connected devices">
          <div className="space-y-3">
            {[
              { name: "Main Smart Meter", status: "Connected", lastSync: "2 minutes ago" },
              { name: "HVAC Smart Thermostat", status: "Connected", lastSync: "5 minutes ago" },
              { name: "Smart Plug #1", status: "Connected", lastSync: "1 hour ago" },
              { name: "Smart Plug #3", status: "Offline", lastSync: "2 days ago" },
            ].map((device) => (
              <div key={device.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1F1F23] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last sync: {device.lastSync}</p>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${device.status === "Connected" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"}`}>
                  {device.status}
                </div>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={<Bell className="w-5 h-5" />} title="Notifications" description="Control how and when you receive alerts">
          <div className="space-y-4">
            {[
              { label: "Peak Usage Alerts", description: "Notify when usage exceeds threshold", enabled: true },
              { label: "Daily Summary", description: "Daily energy consumption report", enabled: true },
              { label: "Weekly Report", description: "Weekly energy analysis", enabled: false },
              { label: "Device Offline", description: "Alert when device goes offline", enabled: true },
              { label: "Maintenance Reminders", description: "System maintenance notifications", enabled: false },
            ].map((notif) => (
              <label key={notif.label} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={notif.enabled} className="w-4 h-4 rounded border-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{notif.description}</p>
                </div>
              </label>
            ))}
          </div>
        </SettingSection>

        {/* Security */}
        <SettingSection icon={<Lock className="w-5 h-5" />} title="Security" description="Manage your account security">
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-[#1F1F23] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
            </button>
            <button className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-[#1F1F23] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enhance account security</p>
            </button>
            <button className="w-full px-4 py-2 text-left bg-gray-50 dark:bg-[#1F1F23] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B2B30] transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Active Sessions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage your login sessions</p>
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
    </Layout>
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

function SettingItem({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action?: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#1F1F23] last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
      </div>
      {action && <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">{action}</button>}
    </div>
  )
}
