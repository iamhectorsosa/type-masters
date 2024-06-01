import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Stats: React.FC<{
  winCount: number
  matchesCount: number
  bestWpm: number
  accuracy: number
}> = ({ winCount, matchesCount, bestWpm, accuracy }) => {
  return (
    <div className="w-full space-y-3">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winCount}</div>
          {matchesCount ? (
            <p className="text-xs text-muted-foreground">
              Won {winCount / matchesCount}% out of {matchesCount} matches
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No stats registered</p>
          )}
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best WPM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bestWpm}</div>
          {matchesCount ? (
            <p className="text-xs text-muted-foreground">
              {accuracy}% best accuracy
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No stats registered</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
