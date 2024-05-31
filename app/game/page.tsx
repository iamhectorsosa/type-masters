"use client"

import { useEffect, useState } from "react"
import { generateNewPhraseText } from "@/utils/game"
import confetti from "canvas-confetti"

import { timeFormat } from "@/lib/time"
import { Phrase } from "@/components/game/phrase"
import { Race } from "@/components/game/race"
import { Results } from "@/components/game/results"

import { useTimer } from "./hooks/useTimer"

const MOCK_PLAYERS = [
  { username: "Player 2", percentage: 20, hue: "201" },
  { username: "Player 3", percentage: 3, hue: "231" },
  { username: "Player 4", percentage: 40, hue: "311" },
  { username: "Player 5", percentage: 90, hue: "21" },
]

export default function Page() {
  const [playerPercentage, setPlayerPercentage] = useState<number>(0)
  const [phrase] = useState(generateNewPhraseText(20))
  const { time, startTimer, stopTimer } = useTimer()

  useEffect(() => {
    // Recieved start signal from supabase realtime
    startTimer()
  }, [startTimer])

  const handleRaceComplete = () => {
    stopTimer()
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
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
          onValueChange={setPlayerPercentage}
          onComplete={handleRaceComplete}
        />
      ) : (
        <Results
          players={[
            {
              place: 1,
              time,
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
