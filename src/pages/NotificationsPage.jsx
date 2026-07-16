import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../hooks/useAuth.js'
import {
  getNotifications,
  markNotificationAsRead,
  subscribeNotification,
} from '../services/notificationService.js'
import { getSupabase } from '../supabase/client.js'
import { formatRelative } from '../utils/date.js'
import { queryKeys } from '../utils/queryKeys.js'

export default function NotificationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user.id

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(userId),
    queryFn: () => getNotifications(userId),
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  useEffect(() => {
    const channel = subscribeNotification({
      userId,
      onInsert: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      },
      onUpdate: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      },
    })

    return () => {
      getSupabase().removeChannel(channel)
    }
  }, [queryClient, userId])

  if (notificationsQuery.isLoading) return <LoadingSpinner />
  if (notificationsQuery.isError) return <ErrorState message={notificationsQuery.error.message} />

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BellRing className="text-blue-600" size={20} />
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      </div>

      {notificationsQuery.data.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Aktivitas terbaru akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {notificationsQuery.data.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 ${item.is_read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}
            >
              <p className="text-sm text-slate-800">{item.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">{formatRelative(item.created_at)}</span>
                {!item.is_read && (
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                    onClick={() => markReadMutation.mutate(item.id)}
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
