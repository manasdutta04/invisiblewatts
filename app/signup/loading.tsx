export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
          <div className="h-7 w-52 rounded-lg bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-2xl border border-gray-200 dark:border-[#1F1F23] p-8 space-y-5">
          <div className="h-10 rounded-lg bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
          <div className="h-10 rounded-lg bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
          <div className="h-10 rounded-lg bg-gray-200 dark:bg-[#1F1F23] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
