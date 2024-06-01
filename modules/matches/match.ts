"use server"

import { calculateAccuracy, calculateWPM, timeElapsed } from "@/utils/game"

import { createClient } from "@/modules/utils/server"

import { Database } from "../types"

type ServerError = {
  error: { message: string }
}
type UserMatch = Database["public"]["Tables"]["user_matches"]["Row"]
type UserMatchId = Pick<UserMatch, "match_id" | "user_id">

export async function getMatch(options: Partial<{ match_id: string }>) {
  if (!options.match_id) {
    return {
      error: { message: "Attempt error - an error occurred with your update" },
    }
  }

  const supabase = createClient()

  const match = await supabase
    .from("matches")
    .select(`*, user_matches(*, profiles(*))`)
    .eq("id", options.match_id)

  if (match.error)
    return { error: { message: match.error.message } } as ServerError

  return match.data[0]
}

export async function getUserMatch(
  options: Partial<UserMatchId>
): Promise<ServerError | UserMatch> {
  if (!options.match_id || !options.user_id) {
    return {
      error: { message: "Attempt error - an error occurred with your select" },
    }
  }

  const supabase = createClient()

  const match = await supabase
    .from("user_matches")
    .select(`*`)
    .eq("match_id", options.match_id)
    .eq("user_id", options.user_id)

  if (match.error) return { error: { message: match.error.message } }

  return match.data[0]
}

export async function finishMatch(
  options: Partial<{
    phrase: string
    correct: number
    wrong: number
    finish: Date
  }> &
    UserMatchId
): Promise<ServerError | void> {
  if (!options.match_id || !options.user_id) {
    return {
      error: { message: "Attempt error - an error occurred with your update" },
    }
  }

  const supabase = createClient()

  const match = await supabase
    .from("user_matches")
    .select(`*`)
    .eq("match_id", options.match_id)
    .eq("user_id", options.user_id)

  if (match.error) return { error: { message: match.error.message } }

  if (match.data[0].match_finished) {
    return {
      error: {
        message: "Attempt error - match already finished",
      },
    }
  }

  if (!match.data[0].match_started || !options.finish) {
    return {
      error: {
        message:
          "Attempt error - match not started or finish time not provided",
      },
    }
  }

  if (!options.phrase) {
    return {
      error: { message: "Attempt error - phrase must be defined" },
    }
  }

  const time: number = timeElapsed(
    new Date(match.data[0].match_started),
    options.finish
  )

  const { error } = await supabase
    .from("user_matches")
    .update({
      match_finished: new Date().toISOString(),
      wpm: calculateWPM(time, options.phrase),
      accuracy: calculateAccuracy(options.correct ?? 0, options.wrong ?? 0),
    })
    .eq("match_id", options.match_id)
    .eq("user_id", options.user_id)

  if (error) return { error: { message: error.message } }
}

export async function startMatch(
  options: Partial<UserMatchId & { start: Date }>
): Promise<ServerError | void> {
  if (!options.match_id || !options.user_id) {
    return {
      error: { message: "Attempt error - an error occurred with your update" },
    }
  }

  const supabase = createClient()

  const match = await supabase
    .from("user_matches")
    .select(`*`)
    .eq("match_id", options.match_id)
    .eq("user_id", options.user_id)

  if (match.error) return { error: { message: match.error.message } }

  if (match.data[0].match_started) {
    return {
      error: {
        message: "Attempt error - match already started",
      },
    }
  }

  const { error } = await supabase
    .from("user_matches")
    .update({
      match_started: options.start?.toISOString(),
    })
    .eq("match_id", options.match_id)
    .eq("user_id", options.user_id)

  if (error) return { error: { message: error.message } }
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
    .eq("user_id", options.user_id)

  if (error) return { error: { message: error.message } }
}
