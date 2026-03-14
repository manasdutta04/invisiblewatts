import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

function SettingSectionSkeleton({ rowCount = 2 }: { rowCount?: number }) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-44" />
        </div>
      </div>
      {/* Section body */}
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Account — avatar strip + 2 forms */}
        <SettingSectionSkeleton rowCount={2} />
        {/* Carbon Goals */}
        <SettingSectionSkeleton rowCount={2} />
        {/* Your Data */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#1F1F23]">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-10 rounded-lg" />
              <Skeleton className="flex-1 h-10 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl p-6 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 space-y-3">
          <Skeleton className="h-5 w-28 bg-red-200 dark:bg-red-800" />
          <Skeleton className="h-3 w-36 bg-red-200 dark:bg-red-800" />
          <Skeleton className="h-9 w-36 rounded-lg bg-red-200 dark:bg-red-800" />
        </div>
      </div>
    </Layout>
  )
}
