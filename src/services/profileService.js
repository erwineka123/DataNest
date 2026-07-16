import { getSupabase } from '../supabase/client.js'

export async function getProfileByUserId(userId) {
  const client = getSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getProfileByUsername(username) {
  const client = getSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  if (error) throw error
  return data
}

export async function updateMyProfile(userId, payload) {
  const client = getSupabase()
  const { data, error } = await client
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getProfileThreads(username) {
  const client = getSupabase()
  const profile = await getProfileByUsername(username)
  const { data, error } = await client
    .from('threads')
    .select(
      'id,title,excerpt,created_at,comment_count,like_count,view_count,categories!threads_category_id_fkey(name,slug),profiles!threads_author_id_fkey(username,avatar_url)',
    )
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProfileComments(username) {
  const client = getSupabase()
  const profile = await getProfileByUsername(username)
  const { data, error } = await client
    .from('comments')
    .select(
      'id,content,created_at,like_count,thread_id,threads!comments_thread_id_fkey(title),profiles!comments_author_id_fkey(username)',
    )
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getBookmarks(userId) {
  const client = getSupabase()
  const { data, error } = await client
    .from('bookmarks')
    .select(
      'id,created_at,threads(id,title,excerpt,created_at,comment_count,like_count,view_count,categories(name,slug),profiles!threads_author_id_fkey(username,avatar_url))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
