"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarPlaceholder } from "@/components/avatar-placeholder"

import { signOut } from "@/modules/user/auth"
import { getProfile } from "@/modules/user/profile"

const DEFAULT_HUE = 100

export const ProfileDropdown: React.FC<{
  userId: string
}> = ({ userId }) => {
  const profile = useQuery({
    queryKey: ["profiles", userId],
    queryFn: () => getProfile({ id: userId }),
  })

  const logout = useMutation({
    mutationFn: signOut,
  })

  function handleSignOut() {
    logout.mutate({
      redirect: {
        url: "/login",
      },
    })
  }

  if (profile.data && "error" in profile.data) {
    return (
      <div className="relative ml-auto flex size-9 overflow-hidden rounded-full bg-destructive" />
    )
  }

  if (profile.isLoading || !profile.data) {
    return (
      <div className="relative ml-auto flex size-9 animate-pulse overflow-hidden rounded-full bg-muted" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="ml-auto overflow-hidden rounded-full"
        >
          <AvatarPlaceholder
            preferredHue={
              profile?.data?.preferred_hue ?? DEFAULT_HUE.toString()
            }
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="end">
        <DropdownMenuLabel>{profile?.data.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/accounts">Accounts</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/credentials">Credentials</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSignOut()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
