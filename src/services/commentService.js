import { getSupabase } from '../supabase/client.js'
import { sanitizeHtml } from '../utils/sanitize.js'

function sortComments(items, sort) {
  const sorted = [...items]
  if (sort === 'oldest') {
    sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return sorted
  }
  if (sort === 'most_liked') {
    sorted.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    return sorted
  }
  sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return sorted
}

function buildTree(items, parentId = null) {
  return items
    .filter((item) => item.parent_comment_id === parentId)
    .map((item) => ({
      ...item,
      replies: buildTree(items, item.id),
    }))
}

export async function getCommentsByThreadId(threadId, sort = 'newest') {
  const client = getSupabase()
  const { data, error } = await client
    .from('comments')
    .select(
      'id,thread_id,parent_comment_id,author_id,content,like_count,created_at,updated_at,profiles!comments_author_id_fkey(id,username,avatar_url,display_name)',
    )
    .eq('thread_id', threadId)

  if (error) throw error

  const sorted = sortComments(data ?? [], sort)
  return buildTree(sorted)
}

export async function addComment({ threadId, authorId, content, parentCommentId = null }) {
  const client = getSupabase()
  const { data, error } = await client
    .from('comments')
    .insert({
      thread_id: threadId,
      author_id: authorId,
      parent_comment_id: parentCommentId,
      content: sanitizeHtml(content),
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateComment({ commentId, content }) {
  const client = getSupabase()
  const { data, error } = await client
    .from('comments')
    .update({ content: sanitizeHtml(content) })
    .eq('id', commentId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteComment(commentId) {
  const client = getSupabase()
  const { error } = await client.from('comments').delete().eq('id', commentId)
  if (error) throw error
}
