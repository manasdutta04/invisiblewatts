import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import type { Profile, UserPreferences } from "@/lib/supabase/types"
import SettingsContent from "@/components/kokonutui/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: prefs },
    { count: entryCount },
    { count: analysisCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user?.id ?? "").single(),
    supabase.from("user_preferences").select("*").eq("user_id", user?.id ?? "").single(),
    supabase.from("usage_entries").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
    supabase.from("ai_analysis").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
  ])

  return (
    <Layout>
      <SettingsContent
        profile={profile as Profile | null}
        prefs={prefs as UserPreferences | null}
        entryCount={entryCount ?? 0}
        analysisCount={analysisCount ?? 0}
      />
    </Layout>
  )
}
