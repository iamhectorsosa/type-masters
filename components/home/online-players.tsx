import * as React from "react"

import { AvatarPlaceholder } from "./avatar-placeholder"
import { OnlineUsers } from "./dashboard"

export const OnlinePlayers: React.FC<{ players: OnlineUsers }> = ({
  players,
}) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold">Online Players</h3>
      <ul className="divide-y">
        {players.map((player, i) => (
          <li className="py-3" key={i}>
            <div className="flex items-center gap-x-2">
              <AvatarPlaceholder preferredHue={player.preferredHue} />
              {player.username}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
