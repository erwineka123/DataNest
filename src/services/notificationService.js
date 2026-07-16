import { getSupabase } from '../supabase/client.js'

export async function getNotifications(userId) {
  const client = getSupabase()
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId) {
  const client = getSupabase()
  const { error } = await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  if (error) throw error
}

export function subscribeNotification({ userId, onInsert, onUpdate }) {
  const client = getSupabase()
  const channel = client
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      onInsert,
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      onUpdate,
    )
    .subscribe()
  return channel
}
