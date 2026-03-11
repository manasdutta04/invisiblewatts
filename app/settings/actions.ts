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

  const daily = Number(formData.get("daily_kwh_target"))
  const budget = Number(formData.get("monthly_budget_dollars"))

  await supabase
    .from("user_preferences")
    .update({
      daily_kwh_target: isNaN(daily) ? 60 : daily,
      monthly_budget_dollars: isNaN(budget) ? 300 : budget,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)

  revalidatePath("/settings")
}

export async function updateNotifications(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const notifications = {
    peak_usage: formData.get("peak_usage") === "on",
    daily_summary: formData.get("daily_summary") === "on",
    weekly_report: formData.get("weekly_report") === "on",
    device_offline: formData.get("device_offline") === "on",
    maintenance: formData.get("maintenance") === "on",
  }

  await supabase
    .from("user_preferences")
    .update({ notifications, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)

  revalidatePath("/settings")
}
