"use client"

import React, { FC } from "react"
import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/modules/utils/client"
import { getProfile } from "@/modules/user/profile"

import { DashboardCard } from "./DashboardCard"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const [state, setState] = React.useState("Hello")

  const supabase = createClient()

  React.useEffect(() => {
    const room = supabase.channel("test-room")

    room
      .on("presence", { event: "join" }, ({ newPresences }) => {
        setState(JSON.stringify(newPresences))
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        setState(JSON.stringify(leftPresences))
      })
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState()
        setState(JSON.stringify(newState))
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return
        }

        await room.track({
          name: "Hector",
          result: 0,
          ready: true,
        })
      })

    return () => {
      void supabase.removeChannel(room)
    }
  }, [supabase])

  if (!profile.data || "error" in profile.data) return null

  return (
    <div>
      <h1>Hello {profile.data.username}!</h1>
      <p>{state}</p>
      <DashboardCard />
    </div>
  )
}
