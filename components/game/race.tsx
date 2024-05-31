"use client"

import { FC } from "react"
import { Player } from "@/utils/game"

import { PlayerMarker } from "./player-marker"

const PLAYER_HEIGHT = 46

export const Race: FC<{ players: Player[] }> = ({ players }) => {
  return (
    <div
      className="relative border-b-2 border-gray-700"
      style={{ height: PLAYER_HEIGHT * players.length }}
    >
      {players.map((player, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            height: (i + 1) * PLAYER_HEIGHT,
            zIndex: players.length - i,
            left: `${player.percentage}%`,
          }}
        >
          <PlayerMarker player={player} />
        </div>
      ))}
    </div>
  )
}
