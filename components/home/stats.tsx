import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Stats: React.FC<{
  winCount: number
  matchesCount: number
  averageWpm: number
  acurracyPercentage: number
}> = ({ winCount, matchesCount, averageWpm, acurracyPercentage }) => {
  return (
    <div className="w-full space-y-3">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Wins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winCount}</div>
          <p className="text-xs text-muted-foreground">
            {winCount / matchesCount}% of matches
          </p>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageWpm}</div>
          <p className="text-xs text-muted-foreground">
            {acurracyPercentage}% accuracy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
