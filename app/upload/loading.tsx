import Layout from "@/components/kokonutui/layout"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#1F1F23] ${className ?? ""}`} />
)

export default function UploadLoading() {
  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-200 dark:border-[#1F1F23] rounded-xl p-8 space-y-4">
            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </Layout>
  )
}
