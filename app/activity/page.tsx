import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import ActivityContent from "@/components/kokonutui/activity-content"
import type { ActivityEvent } from "@/lib/supabase/types"

export default async function ActivityPage() {
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
