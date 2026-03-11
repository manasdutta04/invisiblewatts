import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import ActivityContent from "@/components/kokonutui/activity-content"
import type { ActivityEvent } from "@/lib/supabase/types"
import { cookies } from "next/headers"
import { DEMO_ACTIVITY_EVENTS } from "@/lib/demo-data"

export default async function ActivityPage() {
  const cookieStore = await cookies()
  const isDemoMode = cookieStore.get("iw_demo_mode")?.value === "1"

  if (isDemoMode) {
    return (
      <Layout>
        <ActivityContent events={DEMO_ACTIVITY_EVENTS} isDemoMode />
      </Layout>
    )
  }

  const supabase = await createClient()

  const { data: events } = await supabase
    .from("activity_events")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(20)

  return (
    <Layout>
      <ActivityContent events={(events ?? []) as ActivityEvent[]} />
    </Layout>
  )
}
