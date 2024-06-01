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

import { timeFormat } from "@/lib/time"
import { Phrase } from "@/components/game/phrase"
import { Race } from "@/components/game/race"
import { Results } from "@/components/game/results"

import { finishMatch, getMatch, startMatch } from "@/modules/matches/match"

import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { useTimer } from "./hooks/useTimer"

const MOCK_PLAYERS = [
  { username: "Player 2", percentage: 20, hue: "201" },
  { username: "Player 3", percentage: 3, hue: "231" },
  { username: "Player 4", percentage: 40, hue: "311" },
  { username: "Player 5", percentage: 90, hue: "21" },
]

export const GameShell: FC<{ matchId: string; userId: string }> = ({
  matchId,
  userId,
}) => {
  const [playerPercentage, setPlayerPercentage] = useState<number>(0)
  const [phrase] = useState(generateNewPhraseText(20))
  const { time, startTimer, stopTimer } = useTimer()

  const [accuracy, setAccuracy] = useState<number | null>(null)

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

  const handlePhraseValueChange = (
    percentage: number,
    [correct, wrong]: [number, number]
  ) => {
    setPlayerPercentage(percentage)
    setAccuracy(calculateAccuracy(correct, wrong))
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
      <Race
        players={[
          { username: "Player 1", percentage: playerPercentage, hue: "31" },
          ...MOCK_PLAYERS,
        ]}
      />
      {!startMutation.data?.error && (
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
