"use client"

import Layout from "@/components/kokonutui/layout"
import { Sparkles, TrendingDown, Zap, AlertCircle, Lightbulb } from "lucide-react"

const insights = [
  {
    id: 1,
    icon: "💡",
    title: "HVAC Optimization Opportunity",
    description: "Your HVAC system shows 23% higher-than-normal consumption. Scheduling maintenance could save $45/month.",
    priority: "high",
    impact: "Save $540/year",
    action: "Schedule Maintenance",
  },
  {
    id: 2,
    icon: "🌙",
    title: "Time-of-Use Savings",
    description: "Shifting 2 hours of appliance use to off-peak hours could save 12% on your bill.",
    priority: "medium",
    impact: "Save $149/year",
    action: "View Recommendations",
  },
  {
    id: 3,
    icon: "🏠",
    title: "Heating System Upgrade",
    description: "Upgrading to a high-efficiency heat pump could reduce winter energy by 35%.",
    priority: "medium",
    impact: "Save $680/year",
    action: "Learn More",
  },
  {
    id: 4,
    icon: "💧",
    title: "Water Heater Insights",
    description: "Your water heating peaks at 7AM daily. Preheating water during off-peak hours recommended.",
    priority: "low",
    impact: "Save $85/year",
    action: "Configure Preheating",
  },
  {
    id: 5,
    icon: "🔋",
    title: "Battery Storage Potential",
    description: "Solar + battery system could offset 78% of your annual energy needs.",
    priority: "high",
    impact: "Save $2,100/year",
    action: "Get Quote",
  },
  {
    id: 6,
    icon: "🌞",
    title: "Weather-Based Predictions",
    description: "Cooler temperatures expected next week. Expect 15% reduction in cooling costs.",
    priority: "info",
    impact: "Save $25 this week",
    action: "View Details",
  },
]

export default function AIInsightsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Energy Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Personalized recommendations powered by machine learning</p>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Potential Savings</h2>
              <p className="text-blue-100 mb-4">$3,879 annually based on AI analysis</p>
              <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                See All Opportunities
              </button>
            </div>
            <Sparkles className="w-12 h-12 text-blue-100 opacity-50" />
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>

        {/* AI Analysis Timeline */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">AI Analysis Trends</h2>
          <div className="space-y-4">
            {[
              { date: "This Month", analysis: "Usage trending up due to increased HVAC operation (heating season)" },
              { date: "Last Month", analysis: "Peak hours shifted later by 1 hour due to weather changes" },
              { date: "Last Quarter", analysis: "Average daily consumption increased 8% YoY due to increased occupancy" },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-[#1F1F23] last:border-b-0">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-600 dark:text-gray-400">{item.date}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.analysis}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function InsightCard({ insight }: { insight: (typeof insights)[0] }) {
  const priorityStyles = {
    high: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900",
    medium: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900",
    low: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900",
  }

  const priorityBadge = {
    high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    low: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    info: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  }

  return (
    <div className={`rounded-xl p-6 border ${priorityStyles[insight.priority as keyof typeof priorityStyles]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{insight.icon}</div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityBadge[insight.priority as keyof typeof priorityBadge]}`}>
          {insight.priority.toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{insight.title}</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{insight.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{insight.impact}</div>
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          {insight.action}
        </button>
      </div>
    </div>
  )
}
