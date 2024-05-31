"use client"

import React, { FC } from "react"
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { createClient } from "@/modules/utils/client"
import { getProfile } from "@/modules/user/profile"

import { DashboardCard } from "./DashboardCard"

type OnlineUser = {
  username: string
  presence_ref?: string
}

const onlineUserSchema = z.array(
  z.object({
    username: z.string(),
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
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const users = onlineUserSchema.safeParse(newPresences)
        if (users.success) {
          setUsers(users.data)
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const users = onlineUserSchema.safeParse(leftPresences)
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
        }
        await room.track(user)
      })

    return () => {
      void supabase.removeChannel(room)
    }
  }, [profile.data, supabase])

  if (!profile.data || "error" in profile.data) return null

  return (
    <div className="mx-auto flex max-w-lg items-center justify-center py-12">
      <div className="w-full space-y-3">
        <h1>Hello, {profile.data.username}!</h1>
        <div className="flex gap-x-2">
          <DashboardCard winCount={0} matchesCount={1} />
          <DashboardCard winCount={0} matchesCount={1} />
          <DashboardCard winCount={0} matchesCount={1} />
        </div>
        <div>
          <ul>
            {users.map((user, i) => (
              <li key={i}>{user.username}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
