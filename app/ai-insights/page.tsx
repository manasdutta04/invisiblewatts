import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import AiInsightsContent from "@/components/kokonutui/ai-insights-content"
import type { AiAnalysis } from "@/lib/supabase/types"

export default async function AIInsightsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: analyses } = await supabase
    .from("ai_analysis")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <Layout>
      <AiInsightsContent analyses={(analyses ?? []) as AiAnalysis[]} />
    </Layout>
  )
}
