import { getSupabase } from '../supabase/client.js'

export async function reportThread({ reporterId, threadId, reportReason }) {
  const client = getSupabase()
  const { error } = await client.from('reports').insert({
    reporter_id: reporterId,
    thread_id: threadId,
    report_reason: reportReason,
  })
  if (error) throw error
}

export async function reportComment({ reporterId, commentId, reportReason }) {
  const client = getSupabase()
  const { error } = await client.from('reports').insert({
    reporter_id: reporterId,
    comment_id: commentId,
    report_reason: reportReason,
  })
  if (error) throw error
}
