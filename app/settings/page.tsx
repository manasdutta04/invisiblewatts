import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import SettingsContent from "@/components/kokonutui/settings-content"
import type { Profile, UserPreferences, Device } from "@/lib/supabase/types"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: prefs }, { data: devices }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id ?? "")
        .single(),
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .single(),
      supabase
        .from("devices")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: true }),
    ])

  return (
    <Layout>
      <SettingsContent
        profile={profile as Profile | null}
        prefs={prefs as UserPreferences | null}
        devices={(devices ?? []) as Device[]}
      />
    </Layout>
  )
}
