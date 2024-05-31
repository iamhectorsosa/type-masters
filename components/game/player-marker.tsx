"use client"

import { FC } from "react"
import { generateHSL } from "@/utils/colors"
import { Player } from "@/utils/game"

export const PlayerMarker: FC<{ player: Player }> = ({
  player: { username, hue },
}) => {
  const [color1, color2] = generateHSL({ hue, theme: "dark" })

  return (
    <div
      className={`inline-block h-full border-l-2`}
      style={{ borderColor: color1 }}
    >
      <div
        className="h-4 w-full"
        style={{
          background: `linear-gradient(to top right, ${color1} 25%, ${color2})`,
        }}
      ></div>
      <div className="text-nowrap px-2">{username}</div>
    </div>
  )
}
