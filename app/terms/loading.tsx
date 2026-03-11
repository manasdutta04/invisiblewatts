import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function TermsLoading() {
  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-60" />
        </div>

        {/* 10 prose sections */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            {i % 3 === 0 && <Skeleton className="h-4 w-4/5" />}
          </div>
        ))}

        {/* Contact section */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </Layout>
  )
}
