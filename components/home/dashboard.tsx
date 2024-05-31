"use client"

import React, { FC } from "react"
import { CircleIcon } from "@radix-ui/react-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { OnlinePlayers } from "@/components/home/online-players"
import { Stats } from "@/components/home/stats"

import { createClient } from "@/modules/utils/client"
import { signOut } from "@/modules/user/auth"
import { getProfile } from "@/modules/user/profile"

import { Button } from "../ui/button"

const onlineUserSchema = z.array(
  z.object({
    username: z.string(),
    preferredHue: z.string(),
    presence_ref: z.string().optional(),
  })
)

export type OnlineUsers = z.infer<typeof onlineUserSchema>

const LOBBY_ROOM = "lobby-room"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const logout = useMutation({
    mutationFn: signOut,
  })

  const [users, setUsers] = React.useState<OnlineUsers>([])

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

        const user: OnlineUsers[number] = {
          username: profile.data.username,
          preferredHue: profile.data.preferred_hue,
        }
        await room.track(user)
      })

    return () => {
      void supabase.removeChannel(room)
    }
  }, [profile.data, supabase])

  if (!profile.data || "error" in profile.data) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-lg items-center justify-center py-12">
        <CircleIcon className="size-12 animate-spin" />
      </div>
    )
  }

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
        <div className="flex w-full justify-center">
          <Button
            onClick={() =>
              logout.mutate({
                redirect: {
                  url: "/login",
                },
              })
            }
            variant="link"
            size={"sm"}
          >
            {logout.isPending && (
              <CircleIcon className="mr-2 size-4 animate-spin" />
            )}
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
