import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function HelpLoading() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* 4 FAQ section groups */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
            {/* Section title */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
              <Skeleton className="h-5 w-40" />
            </div>
            {/* FAQ rows */}
            <div className="divide-y divide-gray-200 dark:divide-[#1F1F23]">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="px-6 py-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </Layout>
  )
}
