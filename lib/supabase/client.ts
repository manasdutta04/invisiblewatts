import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 365, // 1 year — persist across browser close
        sameSite: "lax",
      },
    }
  )
}
