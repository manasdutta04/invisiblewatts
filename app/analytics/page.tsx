"use client"

import Layout from "@/components/kokonutui/layout"
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Home, Zap, Wind, Droplet } from "lucide-react"

const monthlyTrend = [
  { month: "Jan", usage: 1200, cost: 150 },
  { month: "Feb", usage: 1100, cost: 137 },
  { month: "Mar", usage: 950, cost: 119 },
  { month: "Apr", usage: 890, cost: 111 },
  { month: "May", usage: 1050, cost: 131 },
  { month: "Jun", usage: 1280, cost: 160 },
  { month: "Jul", usage: 1350, cost: 169 },
  { month: "Aug", usage: 1320, cost: 165 },
]

const consumption = [
  { name: "HVAC", value: 45, color: "#0ea5e9" },
  { name: "Water Heating", value: 20, color: "#f97316" },
  { name: "Lighting", value: 15, color: "#fbbf24" },
  { name: "Appliances", value: 20, color: "#06b6d4" },
]

const timeOfUseData = [
  { period: "00:00-06:00", usage: 180 },
  { period: "06:00-12:00", usage: 320 },
  { period: "12:00-18:00", usage: 580 },
  { period: "18:00-24:00", usage: 420 },
]

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Energy Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed analysis of your energy consumption patterns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Average Daily Usage" value="65.3 kWh" subtext="Last 30 days" color="from-blue-500 to-cyan-500" />
          <StatCard icon={<Home className="w-5 h-5" />} label="Monthly Cost" value="$1,245" subtext="+3% vs last month" color="from-green-500 to-emerald-500" />
          <StatCard icon={<Zap className="w-5 h-5" />} label="Peak Load" value="3.2 kW" subtext="Typical at 6PM" color="from-red-500 to-pink-500" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Trend (8 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="usage" fill="#0ea5e9" stroke="#0ea5e9" name="Usage (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Consumption Breakdown */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Consumption by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consumption}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {consumption.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time of Use */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Time of Use Pattern</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeOfUseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Category Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#1F1F23]">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Monthly (kWh)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">% of Total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "HVAC", kwh: 560, percent: 45, cost: "$70", trend: "↑ 5%" },
                  { name: "Water Heating", kwh: 250, percent: 20, cost: "$31", trend: "↓ 2%" },
                  { name: "Lighting", kwh: 190, percent: 15, cost: "$24", trend: "→ 0%" },
                  { name: "Appliances", kwh: 250, percent: 20, cost: "$31", trend: "↑ 3%" },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-gray-100 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23]">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{row.name}</td>
                    <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{row.kwh}</td>
                    <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{row.percent}%</td>
                    <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{row.cost}</td>
                    <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
}) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23]">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-3`}>{icon}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtext}</div>
    </div>
  )
}
