import * as React from "react"

import { Badge } from "../ui/badge"
import { AvatarPlaceholder } from "./avatar-placeholder"
import { OnlineUsers } from "./dashboard"

export const ConfirmationPlayers: React.FC<{
  selectedPlayers: OnlineUsers
}> = ({ selectedPlayers }) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-2xl font-semibold">
          A game invite has been initiated
        </h3>
        <p className="text-muted-foreground">Waiting for responses</p>
      </div>
      <ul className="divide-y">
        {selectedPlayers.map((player) => (
          <li className="py-3" key={player.id}>
            <div className="flex items-center gap-x-2">
              <div className="flex w-full items-center gap-x-2">
                <AvatarPlaceholder preferredHue={player.preferredHue} />
                {player.username} {player.isHost ? "(Host)" : ""}
                <div className="size-2 rounded-full bg-gradient-to-b from-green-500 to-emerald-500/80" />
              </div>
              {player.status === "PENDING" && (
                <Badge variant="secondary">Pending</Badge>
              )}
              {player.status === "ACCEPTED" && <Badge>Accepted</Badge>}
              {player.status === "DECLINED" && (
                <Badge variant="destructive">Declined</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
