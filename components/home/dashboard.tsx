"use client"

import React, { FC } from "react"
import Link from "next/link"
import { CircleIcon } from "@radix-ui/react-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { OnlinePlayers } from "@/components/home/online-players"
import { Stats } from "@/components/home/stats"

import { createClient } from "@/modules/utils/client"
import { getStats } from "@/modules/stats"
import { signOut } from "@/modules/user/auth"
import { getProfile } from "@/modules/user/profile"

import { Button } from "../ui/button"
import { ConfirmationPlayers } from "./confirmation-players"

const onlineUserSchema = z.array(
  z.object({
    id: z.string(),
    username: z.string(),
    preferredHue: z.string(),
    presence_ref: z.string().optional(),
    status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
    isHost: z.boolean(),
  })
)

export type OnlineUsers = z.infer<typeof onlineUserSchema>

const HOME_ROOM = "home-room"
const LOBBY_ROOM = "lobby-room"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const stats = useQuery({
    queryKey: ["stats", userId],
    queryFn: () => getStats({ id: userId }),
  })

  const logout = useMutation({
    mutationFn: signOut,
  })

  const [users, setUsers] = React.useState<OnlineUsers>([])
  const [selectedPlayers, setSelectedPlayers] = React.useState<OnlineUsers>([])
  const [respondedPlayers, setRespondedPlayers] = React.useState<OnlineUsers>(
    []
  )
  const [awaitingMatch, setAwaitingMatch] = React.useState(false)

  const [status, setStatus] = React.useState<
    "PENDING" | "ACCEPTED" | "DECLINED"
  >("PENDING")

  const supabase = createClient()

  React.useEffect(() => {
    const room = supabase.channel(HOME_ROOM)

    room
      .on("presence", { event: "sync" }, () => {
        const presenceState = room.presenceState()
        const presences = Object.values(presenceState).flatMap((user) => user)
        const users = onlineUserSchema.safeParse(presences)
        if (users.success) {
          setUsers(users.data)
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftPlayers = onlineUserSchema.safeParse(leftPresences)
        if (leftPlayers.success) {
          setSelectedPlayers((selectedPlayers) =>
            selectedPlayers.filter(
              (player) => !leftPlayers.data.map((p) => p.id).includes(player.id)
            )
          )
        }
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          return
        }

        if (!profile.data || "error" in profile.data) return null

        const user: OnlineUsers[number] = {
          id: userId,
          username: profile.data.username,
          preferredHue: profile.data.preferred_hue,
          status: "PENDING",
          isHost: false,
        }
        room.track(user).catch(() => {})
      })

    return () => {
      void supabase.removeChannel(room)
    }
  }, [profile.data, supabase, userId])

  React.useEffect(() => {
    const lobbyRoom = supabase.channel(LOBBY_ROOM, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    lobbyRoom
      .on("broadcast", { event: "game" }, (payload) => {
        const res = onlineUserSchema.safeParse([payload.payload])
        if (res.success) {
          const [user] = res.data
          setAwaitingMatch(true)
          setRespondedPlayers((p) => [user, ...p])
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(lobbyRoom)
    }
  }, [selectedPlayers, supabase, users])

  React.useEffect(() => {
    const lobbyRoom = supabase.channel(LOBBY_ROOM, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    function sendMessage() {
      if (status === "PENDING") return null

      const currentPlayer = users.find((u) => u.id === userId)

      if (currentPlayer && currentPlayer.status === "PENDING") {
        const updatedPlayer = { ...currentPlayer, status }

        void lobbyRoom.send({
          type: "broadcast",
          event: "game",
          payload: updatedPlayer,
        })
      }
    }

    sendMessage()

    return () => {
      void supabase.removeChannel(lobbyRoom)
    }
  }, [supabase, userId, status, users])

  if (
    !profile.data ||
    "error" in profile.data ||
    !stats.data ||
    "error" in stats.data
  ) {
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
          winCount={stats.data.wins}
          matchesCount={stats.data.matches_count}
          bestWpm={stats.data.best_wpm}
          accuracy={stats.data.average_accuracy ?? 0}
        />
        {awaitingMatch ? (
          <>
            <ConfirmationPlayers selectedPlayers={respondedPlayers} />
            {status === "PENDING" && (
              <div className="flex gap-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setStatus("ACCEPTED")}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStatus("DECLINED")}
                >
                  Decline
                </Button>
              </div>
            )}
            {users.length === respondedPlayers.length && (
              <div className="flex gap-x-2">
                <Button asChild>
                  <Link href="/game/0501fb18-c578-40c1-9d78-a28cc6336e34">
                    Begin the match
                  </Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <OnlinePlayers
              players={users.filter((u) => u.id !== userId)}
              selectedPlayers={selectedPlayers}
              setSelectedPlayers={setSelectedPlayers}
            />
            <div className="flex gap-x-2">
              <Button
                disabled={selectedPlayers.length === 0}
                onClick={() => {
                  const host = users.find((u) => u.id === userId)
                  if (host) {
                    setAwaitingMatch(true)
                    setStatus("ACCEPTED")
                    setSelectedPlayers((players) => [
                      { ...host, isHost: true },
                      ...players,
                    ])
                  }
                }}
              >
                Send invite
              </Button>
              <Button
                variant="secondary"
                disabled={selectedPlayers.length === 0}
                onClick={() => setSelectedPlayers([])}
              >
                Clear all
              </Button>
            </div>
          </>
        )}
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
