import { redirect } from "next/navigation"

import { Dashboard } from "@/components/home/Dashboard"

import { createClient } from "@/modules/utils/server"

export default async function Home() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return <Dashboard userId={user.id} />
  }

  redirect("/login")
}
