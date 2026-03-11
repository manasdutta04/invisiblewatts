import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function AnalyticsLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 border border-gray-200 dark:border-[#1F1F23] space-y-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Charts 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
          ))}

          {/* Wide bar chart */}
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] lg:col-span-2 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-gray-200 dark:border-[#1F1F23]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
