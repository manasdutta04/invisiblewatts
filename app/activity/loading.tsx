import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function ActivityLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Activity list card */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
          <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Event title + timestamp */}
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-28 ml-2" />
                    </div>
                    {/* Description */}
                    <Skeleton className="h-3 w-64" />
                    {/* Device badge */}
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
