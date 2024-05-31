"use server"

import { createClient } from "@/modules/utils/server"
import { Database } from "../types"

type ServerError = {
  error: { message: string }
}

type UserMatch = Database['public']['Tables']['user_matches']['Row']

export async function getMatches({ id }: { id: string }) {
  const supabase = createClient()
  const { data, error } = await supabase.from("matches").select(`profiles (*)`)

  if (error) return { error: { message: error.message } }
  return data
}

export async function updateMatch(
  options: Partial<UserMatch>
): Promise<ServerError | void> {
  if (!options.match_id || !options.user_id) {
    return {
      error: { message: "Attempt error - an error occurred with your update" },
    }
  }
  const supabase = createClient()
  const { error } = await supabase
    .from("user_matches")
    .update(options)
    .eq("match_id", options.match_id)
    .eq('user_id', options.user_id)

  if (error) return { error: { message: error.message } }
}
export async function getData() {
  const supabase = createClient()
  const roomOne = supabase.channel("room_01")

  roomOne
    .on("presence", { event: "sync" }, () => {
      const newState = roomOne.presenceState()
      console.log("sync", newState)
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("join", key, newPresences)
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("leave", key, leftPresences)
    })
    .subscribe()
}
