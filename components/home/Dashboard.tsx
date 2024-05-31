"use client"

import { FC } from "react"
import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/modules/utils/client"
import { getProfile } from "@/modules/user/profile"

import { DashboardCard } from "./DashboardCard"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const supabase = createClient()
  const roomOne = supabase.channel("room_01")

  roomOne
    .on("presence", { event: "sync" }, () => {
      const newState = roomOne.presenceState()
      console.log("sync", newState)
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("join", key, newPresences)
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("leave", key, leftPresences)
    })
    .subscribe()

  if (!profile.data || "error" in profile.data) return null

  return (
    <div>
      <h1>Hello {profile.data.username}!</h1>
      <DashboardCard />
    </div>
  )
}
