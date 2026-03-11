import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function ReportsLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* 4 report cards in 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
              </div>

              {/* Meta rows */}
              <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-[#1F1F23]">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-1.5 w-1.5 rounded-full flex-shrink-0" />
                    <Skeleton className="h-3 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom report CTA */}
        <div className="rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#0F0F12] space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
    </Layout>
  )
}
