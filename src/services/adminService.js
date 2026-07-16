import { getSupabase } from '../supabase/client.js'

export async function getAdminStats() {
  const client = getSupabase()
  const [users, threads, comments, reports] = await Promise.all([
    client.from('profiles').select('id,last_seen_at', { count: 'exact' }),
    client.from('threads').select('id', { count: 'exact' }),
    client.from('comments').select('id', { count: 'exact' }),
    client.from('reports').select('id', { count: 'exact' }),
  ])

  if (users.error || threads.error || comments.error || reports.error) {
    throw users.error ?? threads.error ?? comments.error ?? reports.error
  }

  const activeUsers =
    users.data?.filter((item) => {
      const seen = new Date(item.last_seen_at || 0).getTime()
      return Date.now() - seen < 1000 * 60 * 60 * 24 * 7
    }).length ?? 0

  return {
    totalUsers: users.count ?? 0,
    totalThreads: threads.count ?? 0,
    totalComments: comments.count ?? 0,
    reportedPosts: reports.count ?? 0,
    activeUsers,
  }
}

export async function getAdminUsers() {
  const client = getSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('id,username,display_name,avatar_url,bio,role,last_seen_at,created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function updateUserRole({ userId, role }) {
  const client = getSupabase()
  const { error } = await client
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

export async function getAdminReports() {
  const client = getSupabase()
  const { data, error } = await client
    .from('reports')
    .select(
      'id,report_reason,status,created_at,thread_id,comment_id,profiles!reports_reporter_id_fkey(username)',
    )
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function getAdminThreads() {
  const client = getSupabase()
  const { data, error } = await client
    .from('threads')
    .select(
      'id,title,created_at,like_count,view_count,comment_count,profiles!threads_author_id_fkey(username),categories!threads_category_id_fkey(name)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function getAdminComments() {
  const client = getSupabase()
  const { data, error } = await client
    .from('comments')
    .select(
      'id,content,created_at,profiles!comments_author_id_fkey(username),threads!comments_thread_id_fkey(title)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}

export async function getAdminCategories() {
  const client = getSupabase()
  const { data, error } = await client
    .from('categories')
    .select('id,name,slug,description,created_at')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createCategory(payload) {
  const client = getSupabase()
  const { error } = await client.from('categories').insert(payload)
  if (error) throw error
}

export async function deleteThreadAsAdmin(threadId) {
  const client = getSupabase()
  const { error } = await client.from('threads').delete().eq('id', threadId)
  if (error) throw error
}

export async function deleteCommentAsAdmin(commentId) {
  const client = getSupabase()
  const { error } = await client.from('comments').delete().eq('id', commentId)
  if (error) throw error
}

export async function deleteCategoryAsAdmin(categoryId) {
  const client = getSupabase()
  const { error } = await client.from('categories').delete().eq('id', categoryId)
  if (error) throw error
}
