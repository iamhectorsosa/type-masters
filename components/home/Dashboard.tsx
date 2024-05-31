"use client"

import { FC } from "react"
import { useQuery } from "@tanstack/react-query"

import { getProfile } from "@/modules/user/profile"

import { DashboardCard } from "./DashboardCard"

export const Dashboard: FC<{ userId: string }> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  if (!profile.data || "error" in profile.data) return null

  return (
    <div>
      <h1>Hello {profile.data.username}!</h1>
      <DashboardCard />
    </div>
  )
}
