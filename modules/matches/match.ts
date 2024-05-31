import { createClient } from "../utils/server"

export async function getMatches({ id }: { id: string }) {
  const supabase = createClient()
  const { data, error } = await supabase.from("matches").select(`profiles (*)`)

  if (error) return { error: { message: error.message } }
  return data
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
