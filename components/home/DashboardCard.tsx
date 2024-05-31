import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const DashboardCard: React.FC<{
  winCount: number
  matchesCount: number
}> = ({ winCount, matchesCount }) => {
  return (
    <Card>
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
  )
}
