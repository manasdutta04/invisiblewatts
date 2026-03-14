import { LogOut, Settings, CreditCard, FileText } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/app/auth/actions"

export default function Profile01({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const initials = name ? name.slice(0, 1).toUpperCase() : "IW"

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-10 pb-6">
          {/* Avatar + Identity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <div className="w-[72px] h-[72px] rounded-full ring-4 ring-white dark:ring-zinc-900 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">{name}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm truncate">{email}</p>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

          <div className="space-y-1">
            <Link
              href="#"
              className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Subscription</span>
              </div>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Free on Beta</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Settings</span>
            </Link>

            <Link
              href="/terms"
              className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Terms & Policies</span>
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
