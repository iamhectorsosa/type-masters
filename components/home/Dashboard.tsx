"use client"

import React, { FC } from "react"
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { createClient } from "@/modules/utils/client"
import { getProfile } from "@/modules/user/profile"

import { OnlinePlayers } from "./OnlinePlayers"
import { Stats } from "./Stats"

type OnlineUser = {
  username: string
  preferredHue: string
  presence_ref?: string
}

const onlineUserSchema = z.array(
  z.object({
    username: z.string(),
    preferredHue: z.string(),
    presence_ref: z.string().optional(),
  })
)

const LOBBY_ROOM = "lobby-room"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const [users, setUsers] = React.useState<OnlineUser[]>([])

  const supabase = createClient()

  React.useEffect(() => {
    const room = supabase.channel(LOBBY_ROOM)

    room
      .on("presence", { event: "sync" }, () => {
        const presenceState = room.presenceState()
        const presences = Object.values(presenceState).flatMap((user) => user)
        const users = onlineUserSchema.safeParse(presences)
        if (users.success) {
          setUsers(users.data)
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return
        }

        if (!profile.data || "error" in profile.data) return null

        const user: OnlineUser = {
          username: profile.data.username,
          preferredHue: profile.data.preferred_hue,
        }
        await room.track(user)
      })

    return () => {
      void supabase.removeChannel(room)
    }
  }, [profile.data, supabase])

  if (!profile.data || "error" in profile.data) return null

  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-center py-12">
      <div className="w-full space-y-6">
        <div className="w-full space-y-3">
          <h1 className="text-3xl font-bold">Type Masters</h1>
          <h2 className="text-xl">Welcome, {profile.data.username}!</h2>
        </div>
        <Stats
          winCount={0}
          matchesCount={1}
          averageWpm={120}
          acurracyPercentage={2}
        />
        <OnlinePlayers players={users} />
      </div>
    </div>
  )
}
