"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function toggleDemoMode() {
  const store = await cookies()
  const isActive = store.get("iw_demo_mode")?.value === "1"
  store.set("iw_demo_mode", isActive ? "0" : "1", {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: false,
    sameSite: "lax",
  })
  revalidatePath("/", "layout")
}
