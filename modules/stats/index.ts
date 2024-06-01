"use server"

import { Database } from "@/modules/types"
import { createClient } from "@/modules/utils/server"

type Stats = Database["public"]["Tables"]["stats"]["Row"]

type ServerError = {
  error: { message: string }
}

export async function getStats({
  id,
}: {
  id: string
}): Promise<Stats | null | ServerError> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stats")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: { message: error.message } }
  return data
}
