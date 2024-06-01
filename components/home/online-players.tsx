import * as React from "react"

import { Checkbox } from "../ui/checkbox"
import { AvatarPlaceholder } from "./avatar-placeholder"
import { OnlineUsers } from "./dashboard"

export const OnlinePlayers: React.FC<{
  players: OnlineUsers
  selectedPlayers: OnlineUsers
  setSelectedPlayers: (player: OnlineUsers) => void
}> = ({ players, selectedPlayers, setSelectedPlayers }) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-2xl font-semibold">Start a game</h3>
        <p className="text-muted-foreground">
          {selectedPlayers.length === 0
            ? "Invite online players"
            : `You're inviting ${selectedPlayers.length} player(s)`}
        </p>
      </div>
      <ul className="divide-y">
        {players.map((player) => (
          <li className="py-3" key={player.id}>
            <div className="flex items-center gap-x-2">
              <label className="w-full cursor-pointer" htmlFor={player.id}>
                <div className="flex items-center gap-x-2">
                  <AvatarPlaceholder preferredHue={player.preferredHue} />
                  {player.username}
                  <div className="size-2 rounded-full bg-gradient-to-b from-green-500 to-emerald-500/80" />
                </div>
              </label>
              <Checkbox
                checked={selectedPlayers.map((p) => p.id).includes(player.id)}
                onCheckedChange={(checked) =>
                  checked
                    ? setSelectedPlayers([...selectedPlayers, player])
                    : setSelectedPlayers(
                        selectedPlayers.filter((p) => p.id !== player.id)
                      )
                }
                id={player.id}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
