"use client"

import { useState } from "react"

import { Phrase } from "@/components/game/phrase"
import { Race } from "@/components/game/race"

export default function Page() {
  const [playerPercentage, setPlayerPercentage] = useState<number>(0)

  return (
    <div className="space-y-6">
      <Race
        players={[
          { username: "Player 1", percentage: playerPercentage, hue: "31" },
          { username: "Player 2", percentage: 20, hue: "201" },
          { username: "Player 3", percentage: 3, hue: "231" },
          { username: "Player 4", percentage: 40, hue: "311" },
          { username: "Player 5", percentage: 90, hue: "21" },
        ]}
      />
      <Phrase
        phrase="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat non libero ac mattis. Nam consectetur maximus purus a dignissim."
        onValueChange={setPlayerPercentage}
      />
    </div>
  )
}
