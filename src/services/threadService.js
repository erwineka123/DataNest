import { getSupabase } from '../supabase/client.js'
import { sanitizeHtml } from '../utils/sanitize.js'

function applySort(query, sort) {
  switch (sort) {
    case 'oldest':
      return query.order('created_at', { ascending: true })
    case 'most_popular':
      return query.order('like_count', { ascending: false })
    case 'most_viewed':
      return query.order('view_count', { ascending: false })
    case 'newest':
    default:
      return query.order('created_at', { ascending: false })
  }
}

export async function getDashboardData() {
  const client = getSupabase()
  const [{ count: totalUsers, error: userError }, { count: totalThreads, error: threadError }, { count: totalComments, error: commentError }] =
    await Promise.all([
      client.from('profiles').select('id', { count: 'exact', head: true }),
      client.from('threads').select('id', { count: 'exact', head: true }),
      client.from('comments').select('id', { count: 'exact', head: true }),
    ])

  if (userError || threadError || commentError) {
    throw userError ?? threadError ?? commentError
  }

  const { data: trendingThreads, error: trendingError } = await client
    .from('threads')
    .select(
      'id,title,excerpt,created_at,comment_count,like_count,view_count,categories!threads_category_id_fkey(name,slug),profiles!threads_author_id_fkey(username,avatar_url)',
    )
    .order('like_count', { ascending: false })
    .order('view_count', { ascending: false })
    .limit(5)

  if (trendingError) throw trendingError

  const { data: latestThreads, error: latestError } = await client
    .from('threads')
    .select(
      'id,title,excerpt,created_at,comment_count,like_count,view_count,categories!threads_category_id_fkey(name,slug),profiles!threads_author_id_fkey(username,avatar_url)',
    )
    .order('created_at', { ascending: false })
    .limit(5)

  if (latestError) throw latestError

  const { data: categories, error: categoryError } = await client
    .from('categories')
    .select('id,name,slug')
    .order('name', { ascending: true })
    .limit(8)

  if (categoryError) throw categoryError

  return {
    stats: {
      totalUsers: totalUsers ?? 0,
      totalThreads: totalThreads ?? 0,
      totalComments: totalComments ?? 0,
    },
    trendingThreads: trendingThreads ?? [],
    latestThreads: latestThreads ?? [],
    categories: categories ?? [],
  }
}

export async function getThreads(params) {
  const client = getSupabase()
  const page = Number(params.page || 1)
  const pageSize = Number(params.pageSize || 10)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from('threads')
    .select(
      'id,title,excerpt,created_at,comment_count,like_count,view_count,tags,categories!threads_category_id_fkey(id,name,slug),profiles!threads_author_id_fkey(username,avatar_url)',
      { count: 'exact' },
    )
    .range(from, to)

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%`,
    )
  }

  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  if (params.sort === 'unanswered') {
    query = query.eq('comment_count', 0).order('created_at', { ascending: false })
  } else {
    query = applySort(query, params.sort)
  }

  const { data, count, error } = await query
  if (error) throw error

  return {
    data: data ?? [],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  }
}

export async function getThreadById(threadId) {
  const client = getSupabase()
  const { data, error } = await client
    .from('threads')
    .select(
      '*,categories!threads_category_id_fkey(id,name,slug),profiles!threads_author_id_fkey(id,username,display_name,avatar_url),attachments(id,file_url,file_type,file_name)',
    )
    .eq('id', threadId)
    .single()

  if (error) throw error

  const { error: viewError } = await client.rpc('increment_thread_view_count', {
    target_thread_id: threadId,
  })
  if (viewError) throw viewError

  return data
}

export async function createThread({ userId, payload }) {
  const client = getSupabase()
  const sanitizedContent = sanitizeHtml(payload.content)
  const excerpt = sanitizeHtml(payload.content.replace(/<[^>]+>/g, ' ').slice(0, 200))
  const { data, error } = await client
    .from('threads')
    .insert({
      author_id: userId,
      title: payload.title,
      category_id: payload.categoryId,
      tags: payload.tags,
      content: sanitizedContent,
      excerpt,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function toggleLikeThread({ threadId, userId }) {
  const client = getSupabase()
  const { data: liked, error: findError } = await client
    .from('likes')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle()
  if (findError) throw findError

  if (liked) {
    const { error } = await client.from('likes').delete().eq('id', liked.id)
    if (error) throw error
    return false
  }

  const { error } = await client.from('likes').insert({ thread_id: threadId, user_id: userId })
  if (error) throw error
  return true
}

export async function toggleBookmarkThread({ threadId, userId }) {
  const client = getSupabase()
  const { data: saved, error: findError } = await client
    .from('bookmarks')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle()
  if (findError) throw findError

  if (saved) {
    const { error } = await client.from('bookmarks').delete().eq('id', saved.id)
    if (error) throw error
    return false
  }

  const { error } = await client
    .from('bookmarks')
    .insert({ thread_id: threadId, user_id: userId })
  if (error) throw error
  return true
}
