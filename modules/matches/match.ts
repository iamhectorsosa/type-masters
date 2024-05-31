import { createClient } from "../utils/server"

export async function getMatches({
  id,
}: {
  id: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from('matches').select(`profiles (*)`);

  if (error) return { error: { message: error.message } }
  return data
}