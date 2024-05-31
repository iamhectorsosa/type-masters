import { FC } from "react"
import { generateHSL } from "@/utils/colors"
import { PlayerResults } from "@/utils/game"

import { timeFormat } from "@/lib/time"

import { AvatarPlaceholder } from "../home/avatar-placeholder"

export const Results: FC<{ players: PlayerResults[] }> = ({ players }) => {
  const sortedPlayers = players.sort((a, b) =>
    b.place && a.place ? b.place - a.place : -1
  )

  return (
    <ol className="mx-auto w-96 list-none space-y-2">
      {sortedPlayers.map(({ player, place, time }, i) => {
        return (
          <li key={i} className="text-lg">
            <div className="flex w-full justify-between gap-4">
              <div className="">{place ? `${place}.` : "-"}</div>
              <div className="grow border-b-2 border-dotted border-gray-700"></div>
              <div className="flex gap-2">
                <AvatarPlaceholder preferredHue={player.hue} />
                <span>{`${player.username}`}</span>
                {time && <span>{` (${timeFormat(time)})`}</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
