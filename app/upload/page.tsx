import Layout from "@/components/kokonutui/layout"
import { createClient } from "@/lib/supabase/server"
import UploadContent from "@/components/kokonutui/upload-content"

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count } = await supabase
    .from("usage_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "")

  return (
    <Layout>
      <UploadContent existingEntryCount={count ?? 0} />
    </Layout>
  )
}
