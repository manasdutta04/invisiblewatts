"use client"

import Layout from "@/components/kokonutui/layout"
import { Download, FileText, Calendar } from "lucide-react"

const reports = [
  {
    id: 1,
    title: "February 2025 Energy Report",
    date: "Generated on Mar 1, 2025",
    period: "Feb 1 - Feb 28, 2025",
    usage: "1,890 kWh",
    cost: "$236.25",
    highlights: ["5% savings vs last month", "Peak hours: 4PM-8PM", "HVAC: 45% of total consumption"],
  },
  {
    id: 2,
    title: "January 2025 Energy Report",
    date: "Generated on Feb 1, 2025",
    period: "Jan 1 - Jan 31, 2025",
    usage: "1,980 kWh",
    cost: "$247.50",
    highlights: ["Winter heating peak", "Cold weather impact", "12% above normal"],
  },
  {
    id: 3,
    title: "Annual 2024 Energy Report",
    date: "Generated on Jan 1, 2025",
    period: "Jan 1 - Dec 31, 2024",
    usage: "22,450 kWh",
    cost: "$2,806.25",
    highlights: ["Year-over-year analysis", "Seasonal trends", "Cost breakdown by category"],
  },
  {
    id: 4,
    title: "Q4 2024 Energy Report",
    date: "Generated on Dec 31, 2024",
    period: "Oct 1 - Dec 31, 2024",
    usage: "6,250 kWh",
    cost: "$781.25",
    highlights: ["Quarterly comparison", "End-of-year summary", "Conservation metrics"],
  },
]

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Energy Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Download and review your energy consumption reports</p>
        </div>

        {/* Report Filters */}
        <div className="flex gap-3 flex-wrap">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            All Reports
          </button>
          <button className="px-4 py-2 bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-white rounded-lg text-sm font-medium border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
            Monthly
          </button>
          <button className="px-4 py-2 bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-white rounded-lg text-sm font-medium border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
            Quarterly
          </button>
          <button className="px-4 py-2 bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-white rounded-lg text-sm font-medium border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors">
            Annual
          </button>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {/* Custom Report Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#1F1F23] dark:to-[#0F0F12] rounded-xl p-6 border border-blue-200 dark:border-[#2B2B30]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate Custom Report</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Create a custom report for any date range with specific metrics</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            Create Report
          </button>
        </div>
      </div>
    </Layout>
  )
}

function ReportCard({ report }: { report: (typeof reports)[0] }) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-4 h-4" />
              {report.date}
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-lg transition-colors">
          <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-[#1F1F23]">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Period</span>
          <span className="font-medium text-gray-900 dark:text-white">{report.period}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Usage</span>
          <span className="font-medium text-gray-900 dark:text-white">{report.usage}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Estimated Cost</span>
          <span className="font-medium text-gray-900 dark:text-white">{report.cost}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Key Highlights</p>
        {report.highlights.map((highlight, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {highlight}
          </div>
        ))}
      </div>
    </div>
  )
}
