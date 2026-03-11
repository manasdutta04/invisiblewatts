import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function AIInsightsLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Gradient summary banner */}
        <div className="animate-pulse bg-gradient-to-br from-blue-300 to-cyan-300 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-6 space-y-3">
          <Skeleton className="h-7 w-40 bg-white/30 dark:bg-white/10" />
          <Skeleton className="h-4 w-64 bg-white/30 dark:bg-white/10" />
          <Skeleton className="h-9 w-36 rounded-lg bg-white/40 dark:bg-white/10" />
        </div>

        {/* 6 insight cards in 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#1F1F23]">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* AI timeline panel */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-[#1F1F23] last:border-b-0">
              <Skeleton className="h-4 w-24 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
