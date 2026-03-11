import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import ReportsContent from "@/components/kokonutui/reports-content"
import type { AiAnalysis } from "@/lib/supabase/types"

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: analyses }, { count: entriesTotal }] = await Promise.all([
    supabase
      .from("ai_analysis")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id ?? ""),
  ])

  return (
    <Layout>
      <ReportsContent
        analyses={(analyses ?? []) as AiAnalysis[]}
        entriesTotal={entriesTotal ?? 0}
      />
    </Layout>
  )
}
