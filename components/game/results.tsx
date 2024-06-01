import { FC } from "react"
import { PlayerResults, timeElapsed } from "@/utils/game"
import { useQuery } from "@tanstack/react-query"

import { timeFormat } from "@/lib/time"

import { getMatch } from "@/modules/matches/match"

import { AvatarPlaceholder } from "../home/avatar-placeholder"

export const Results: FC<{ matchId: string; userId: string }> = ({
  matchId,
  userId,
}) => {
  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatch({ match_id: matchId }),
  })

  const userFinished =
    match && "error" in match
      ? false
      : match?.user_matches.some((user) => user.user_id === userId)

  const players: PlayerResults[] | null | undefined =
    match && "error" in match
      ? null
      : match?.user_matches.map(
          ({ wpm, accuracy, profiles, match_started, match_finished }) => {
            return {
              wpm,
              accuracy,
              time:
                match_finished && match_started
                  ? timeElapsed(
                      new Date(match_started),
                      new Date(match_finished)
                    )
                  : null,
              player: {
                hue: profiles?.preferred_hue ?? "0",
                username: profiles?.username ?? "noname",
              },
            }
          }
        )

  const sortedPlayers = players?.sort((a, b) =>
    b.time && a.time ? b.time - a.time : -1
  )

  if (!userFinished) return null

  return (
    <ol className="mx-auto list-none space-y-2">
      {sortedPlayers?.map(({ player, time, accuracy, wpm }, i) => {
        return (
          <li key={i} className="text-lg">
            <div className="flex w-full justify-between gap-4">
              <div className="">{time ? `${i + 1}.` : "-"}</div>
              <div className="grow border-b-2 border-dotted border-gray-700"></div>
              <div className="flex items-center gap-2">
                <AvatarPlaceholder preferredHue={player.hue} />
                <span className="font-bold">{`${player.username}`}</span>
                {time && <span>{`time: ${timeFormat(time)}`}</span>}
                {accuracy && <span>{`accuracy: ${accuracy}%`}</span>}
                {wpm && <span>{`wpm: ${wpm}`}</span>}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
