"use client"

import { FC, useEffect, useState } from "react"
import { calculateWPM, generateNewPhraseText } from "@/utils/game"
import { useMutation } from "@tanstack/react-query"
import confetti from "canvas-confetti"

import { timeFormat } from "@/lib/time"
import { Phrase } from "@/components/game/phrase"
import { Race } from "@/components/game/race"
import { Results } from "@/components/game/results"

import { updateMatch } from "@/modules/matches/match"

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

  const updateUserMatch = useMutation({
    mutationFn: updateMatch,
  })

  useEffect(() => {
    // Recieved start signal from supabase realtime
    startTimer()
  }, [startTimer])

  const handleRaceComplete = async () => {
    stopTimer()
    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    updateUserMatch.mutate({
      match_id: matchId,
      user_id: userId,
      wpm: calculateWPM(time, phrase),
    })
  }

  const handlePhraseValueChange = (percentage: number, accuracy: number) => {
    setPlayerPercentage(percentage)
    setAccuracy(accuracy)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{timeFormat(time)}</h1>
      <Race
        players={[
          { username: "Player 1", percentage: playerPercentage, hue: "31" },
          ...MOCK_PLAYERS,
        ]}
      />
      {playerPercentage < 100 ? (
        <Phrase
          phrase={phrase}
          onValueChange={handlePhraseValueChange}
          onComplete={handleRaceComplete}
        />
      ) : (
        <Results
          players={[
            {
              place: 1,
              time,
              accuracy,
              wpm: calculateWPM(time, phrase),
              player: {
                username: "Player 1",
                percentage: playerPercentage,
                hue: "31",
              },
            },
            ...MOCK_PLAYERS.map((player) => ({
              player,
            })),
          ]}
        />
      )}
    </div>
  )
}
