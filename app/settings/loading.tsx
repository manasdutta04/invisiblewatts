import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

function SettingSectionSkeleton({ rowCount = 3 }: { rowCount?: number }) {
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1F1F23] space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-56" />
      </div>
      {/* Section body */}
      <div className="px-6 py-4 space-y-4">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
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

        <SettingSectionSkeleton rowCount={4} />
        <SettingSectionSkeleton rowCount={2} />
        <SettingSectionSkeleton rowCount={4} />
        <SettingSectionSkeleton rowCount={5} />
        <SettingSectionSkeleton rowCount={3} />

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
