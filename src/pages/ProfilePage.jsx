import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { Tabs } from '../components/ui/Tabs.jsx'
import { ProfileCard } from '../components/common/ProfileCard.jsx'
import { ThreadCard } from '../components/common/ThreadCard.jsx'
import {
  getBookmarks,
  getProfileByUsername,
  getProfileComments,
  getProfileThreads,
} from '../services/profileService.js'
import { useAuth } from '../hooks/useAuth.js'
import { queryKeys } from '../utils/queryKeys.js'

const profileTabs = [
  { value: 'threads', label: 'Threads' },
  { value: 'comments', label: 'Comments' },
  { value: 'bookmarks', label: 'Bookmarks' },
]

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('threads')

  const profileQuery = useQuery({
    queryKey: queryKeys.profile(username),
    queryFn: () => getProfileByUsername(username),
  })

  const threadsQuery = useQuery({
    queryKey: queryKeys.profileThreads(username),
    queryFn: () => getProfileThreads(username),
    enabled: activeTab === 'threads',
  })

  const commentsQuery = useQuery({
    queryKey: queryKeys.profileComments(username),
    queryFn: () => getProfileComments(username),
    enabled: activeTab === 'comments',
  })

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.profileBookmarks(user?.id),
    queryFn: () => getBookmarks(user.id),
    enabled: Boolean(user) && activeTab === 'bookmarks',
  })

  if (profileQuery.isLoading) return <LoadingSpinner />
  if (profileQuery.isError) return <ErrorState message={profileQuery.error.message} />

  return (
    <div className="space-y-5">
      <ProfileCard profile={profileQuery.data} />
      <Tabs tabs={profileTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'threads' && (
        <div className="space-y-3">
          {threadsQuery.isLoading ? (
            <LoadingSpinner />
          ) : threadsQuery.data?.length ? (
            threadsQuery.data.map((thread) => <ThreadCard key={thread.id} thread={thread} />)
          ) : (
            <EmptyState title="Belum ada thread" description="User belum memposting thread." />
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-3">
          {commentsQuery.isLoading ? (
            <LoadingSpinner />
          ) : commentsQuery.data?.length ? (
            commentsQuery.data.map((comment) => (
              <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Di thread: {comment.threads?.title}</p>
                <div
                  className="prose prose-sm mt-2 max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </article>
            ))
          ) : (
            <EmptyState title="Belum ada komentar" description="User belum berkomentar." />
          )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {!user ? (
            <EmptyState
              title="Login dibutuhkan"
              description="Bookmark hanya bisa dilihat oleh pemilik akun."
            />
          ) : bookmarksQuery.isLoading ? (
            <LoadingSpinner />
          ) : bookmarksQuery.data?.length ? (
            bookmarksQuery.data.map((bookmark) => (
              <ThreadCard key={bookmark.id} thread={bookmark.threads} />
            ))
          ) : (
            <EmptyState title="Belum ada bookmark" description="Simpan thread favorit Anda." />
          )}
        </div>
      )}
    </div>
  )
}
