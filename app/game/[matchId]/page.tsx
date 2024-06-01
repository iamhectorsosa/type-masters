import { redirect } from "next/navigation"

import { GameShell } from "@/components/game/game-shell"

import { createClient } from "@/modules/utils/server"

export default async function Page({
  params,
}: {
  params: { matchId: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <GameShell userId={user.id} matchId={params.matchId} />
    </div>
  )
}
