"use client"

import { FC, useEffect, useState } from "react"
import {
  calculateAccuracy,
  calculateWPM,
  generateNewPhraseText,
  PlayerResults,
  timeElapsed,
} from "@/utils/game"
import { CrossCircledIcon } from "@radix-ui/react-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import confetti from "canvas-confetti"
import { z } from "zod"

import { timeFormat } from "@/lib/time"
import { Phrase } from "@/components/game/phrase"
import { Race } from "@/components/game/race"
import { Results } from "@/components/game/results"

import { createClient } from "@/modules/utils/client"
import {
  finishMatch,
  getMatch,
  getUserMatch,
  startMatch,
} from "@/modules/matches/match"
import { getProfile } from "@/modules/user/profile"

import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { useTimer } from "./hooks/useTimer"

const MOCK_PLAYERS = [
  { username: "Player 2", percentage: 20, hue: "201" },
  { username: "Player 3", percentage: 3, hue: "231" },
  { username: "Player 4", percentage: 40, hue: "311" },
  { username: "Player 5", percentage: 90, hue: "21" },
]

const playerSchema = z.object({
  userId: z.string(),
  percentage: z.number(),
  username: z.string(),
  hue: z.string(),
})

const playersSchema = z.array(playerSchema)

export type PlayerSchema = z.infer<typeof playersSchema>

export const GameShell: FC<{ matchId: string; userId: string }> = ({
  matchId,
  userId,
}) => {
  const { data: profileData } = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  // const { data: matchData } = useQuery({
  //   queryKey: ["match", matchId],
  //   queryFn: () => getMatch({ match_id: matchId }),
  // })

  // const { data: userMatchData, isLoading: userMatchLoading } = useQuery({
  //   queryKey: ["userMatch", matchId, userId],
  //   queryFn: () => getUserMatch({ match_id: matchId, user_id: userId }),
  // })

  const [playerPercentage, setPlayerPercentage] = useState<number>(0)
  const [phrase] = useState(generateNewPhraseText(20))
  const { time, started, startTimer, stopTimer } = useTimer()

  const [players, setPlayers] = useState<PlayerSchema>([])

  const [, setAccuracy] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const room = supabase.channel(matchId)

    room
      .on("presence", { event: "sync" }, () => {
        const presenceState = room.presenceState()
        const presences = Object.values(presenceState).flatMap((user) => user)
        const users = playersSchema.safeParse(presences)

        if (users.success) {
          setPlayers(users.data)
        }
      })
      .on("broadcast", { event: "percentage-update" }, (payload) => {
        const newPlayerData = playerSchema.safeParse(payload.payload)
        if (newPlayerData.success) {
          setPlayers((prev) =>
            prev.map((player) => {
              if (player.userId === newPlayerData.data.userId) {
                return newPlayerData.data
              }

              return player
            })
          )
        }
      })
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          return
        }

        if (!profileData || "error" in profileData) return null

        const user: PlayerSchema[number] = {
          userId,
          hue: profileData.preferred_hue,
          username: profileData.username,
          percentage: playerPercentage,
        }
        room.track(user).catch(() => {})
      })

    return () => {
      void supabase.removeChannel(room)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, profileData, supabase, userId])

  const { mutate: start, ...startMutation } = useMutation({
    mutationFn: startMatch,
  })

  const { mutate: finish, ...finishMutation } = useMutation({
    mutationFn: finishMatch,
  })

  useEffect(() => {
    // Recieved start signal from supabase realtime
    const startTime = startTimer()
    start({ match_id: matchId, user_id: userId, start: startTime })
  }, [matchId, userId, startTimer, start])

  const handleRaceComplete = async ([correct, wrong]: [number, number]) => {
    const stopTime = stopTimer()
    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    finish({
      match_id: matchId,
      user_id: userId,
      phrase,
      correct,
      wrong,
      finish: stopTime,
    })
  }

  const handlePhraseValueChange = async (
    percentage: number,
    [correct, wrong]: [number, number]
  ) => {
    setPlayerPercentage(percentage)
    setAccuracy(calculateAccuracy(correct, wrong))

    if (!profileData || "error" in profileData) return null

    const channel = supabase.channel(matchId, {
      config: { broadcast: { self: true } },
    })
    await channel.send({
      type: "broadcast",
      event: "percentage-update",
      payload: {
        percentage,
        userId,
        username: profileData.username,
        hue: profileData.preferred_hue,
      } as PlayerSchema[number],
    })

    await supabase.removeChannel(channel)
  }

  const error = finishMutation.data?.error

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <CrossCircledIcon className="size-4" />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>
            {error.message ?? "Unknown error"}
          </AlertDescription>
        </Alert>
      )}

      <h1 className="text-3xl font-bold">{timeFormat(time)}</h1>
      {started && <Race players={players} />}
      {playerPercentage <= 100 && (
        <Phrase
          phrase={phrase}
          onValueChange={handlePhraseValueChange}
          onComplete={handleRaceComplete}
        />
      )}
      <Results matchId={matchId} userId={userId} />
    </div>
  )
}
