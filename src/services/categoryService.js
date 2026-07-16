import { getSupabase } from '../supabase/client.js'

export async function getCategories() {
  const client = getSupabase()
  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}
