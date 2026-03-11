"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from("profiles")
    .update({ full_name: String(formData.get("full_name") ?? "") })
    .eq("id", user.id)

  revalidatePath("/settings")
}

export async function updateGoals(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const dailyCo2 = Number(formData.get("daily_co2_target"))
  const weeklyHours = Number(formData.get("weekly_screen_time"))

  await supabase
    .from("user_preferences")
    .update({
      daily_kwh_target: isNaN(dailyCo2) ? 500 : dailyCo2,
      monthly_budget_dollars: isNaN(weeklyHours) ? 21 : weeklyHours,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)

  revalidatePath("/settings")
}

export async function clearUsageData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await Promise.all([
    supabase.from("usage_entries").delete().eq("user_id", user.id),
    supabase.from("ai_analysis").delete().eq("user_id", user.id),
  ])

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  revalidatePath("/reports")
  revalidatePath("/ai-insights")
}
