"use client"

import { TrendingDown, Zap, AlertCircle, Lightbulb } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const consumptionData = [
  { hour: "00:00", usage: 45, target: 50 },
  { hour: "04:00", usage: 32, target: 50 },
  { hour: "08:00", usage: 78, target: 50 },
  { hour: "12:00", usage: 95, target: 50 },
  { hour: "16:00", usage: 110, target: 50 },
  { hour: "20:00", usage: 105, target: 50 },
  { hour: "24:00", usage: 65, target: 50 },
]

const weeklyData = [
  { day: "Mon", kWh: 245 },
  { day: "Tue", kWh: 268 },
  { day: "Wed", kWh: 278 },
  { day: "Thu", kWh: 255 },
  { day: "Fri", kWh: 290 },
  { day: "Sat", kWh: 310 },
  { day: "Sun", kWh: 285 },
]

export default function () {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          label="Current Usage"
          value="2.4 kW"
          change="+12% from last hour"
          color="from-blue-500 to-cyan-500"
        />
        <MetricCard
          icon={<TrendingDown className="w-5 h-5" />}
          label="Today's Total"
          value="45.2 kWh"
          change="-8% vs yesterday"
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={<Lightbulb className="w-5 h-5" />}
          label="Monthly Average"
          value="1,245 kWh"
          change="Within target"
          color="from-amber-500 to-orange-500"
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Peak Hours"
          value="16:00 - 20:00"
          change="Next peak in 4h"
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Usage */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Today's Consumption</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Usage (kW)" />
              <Line type="monotone" dataKey="target" stroke="#f97316" strokeWidth={2} dot={false} name="Target (kW)" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Usage */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="kWh" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightCard
          title="Peak Hours Alert"
          description="Your usage typically peaks between 4PM-8PM. Consider shifting loads to off-peak hours."
          icon="⚡"
        />
        <InsightCard
          title="Savings Opportunity"
          description="Upgrading to an energy-efficient HVAC system could save ~15% annually."
          icon="💡"
        />
        <InsightCard
          title="Weather Impact"
          description="Cooler temperatures tomorrow may reduce cooling costs by 8-12%."
          icon="🌤️"
        />
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  color: string
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-3`}>{icon}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{change}</div>
    </div>
  )
}

function InsightCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#1F1F23] dark:to-[#0F0F12] rounded-xl p-4 border border-blue-200 dark:border-[#2B2B30]">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

