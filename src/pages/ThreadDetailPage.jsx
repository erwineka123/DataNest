import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CommentCard } from '../components/common/CommentCard.jsx'
import { RichTextEditor } from '../components/editor/RichTextEditor.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { COMMENT_SORT_OPTIONS } from '../constants/forum.js'
import { useAuth } from '../hooks/useAuth.js'
import { addComment, deleteComment, getCommentsByThreadId, updateComment } from '../services/commentService.js'
import { reportComment, reportThread } from '../services/reportService.js'
import { getThreadById, toggleBookmarkThread, toggleLikeThread } from '../services/threadService.js'
import { formatDate } from '../utils/date.js'
import { queryKeys } from '../utils/queryKeys.js'

export default function ThreadDetailPage() {
  const { threadId } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [commentSort, setCommentSort] = useState('newest')
  const [newComment, setNewComment] = useState('')

  const threadQuery = useQuery({
    queryKey: queryKeys.threadDetail(threadId),
    queryFn: () => getThreadById(threadId),
  })

  const commentsQuery = useQuery({
    queryKey: queryKeys.threadComments(threadId, commentSort),
    queryFn: () => getCommentsByThreadId(threadId, commentSort),
  })

  const addCommentMutation = useMutation({
    mutationFn: (payload) => addComment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-comments', threadId] })
      queryClient.invalidateQueries({ queryKey: ['thread-detail', threadId] })
      toast.success('Komentar berhasil ditambahkan')
    },
    onError: (error) => toast.error(error.message),
  })

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }) => updateComment({ commentId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-comments', threadId] })
      toast.success('Komentar diperbarui')
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread-comments', threadId] })
      toast.success('Komentar dihapus')
    },
    onError: (error) => toast.error(error.message),
  })

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeThread({ threadId, userId: user.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread-detail', threadId] }),
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmarkThread({ threadId, userId: user.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['thread-detail', threadId] }),
  })

  const reportThreadMutation = useMutation({
    mutationFn: (reason) =>
      reportThread({
        reporterId: user.id,
        threadId,
        reportReason: reason,
      }),
    onSuccess: () => toast.success('Thread berhasil dilaporkan'),
    onError: (error) => toast.error(error.message),
  })

  const reportCommentMutation = useMutation({
    mutationFn: ({ commentId, reason }) =>
      reportComment({
        reporterId: user.id,
        commentId,
        reportReason: reason,
      }),
    onSuccess: () => toast.success('Komentar berhasil dilaporkan'),
    onError: (error) => toast.error(error.message),
  })

  if (threadQuery.isLoading || commentsQuery.isLoading) return <LoadingSpinner />
  if (threadQuery.isError) return <ErrorState message={threadQuery.error.message} />
  if (commentsQuery.isError) return <ErrorState message={commentsQuery.error.message} />

  const thread = threadQuery.data

  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex items-center gap-2">
          <Badge>{thread.categories?.name || 'Umum'}</Badge>
          {thread.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{thread.title}</h1>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={thread.profiles?.avatar_url} alt={thread.profiles?.username} size="sm" />
            <span className="text-sm text-slate-700">@{thread.profiles?.username}</span>
          </div>
          <span className="text-xs text-slate-500">
            Dibuat {formatDate(thread.created_at)} · Update {formatDate(thread.updated_at)}
          </span>
        </div>
        <div
          className="prose mt-5 max-w-none prose-headings:text-slate-900 prose-p:text-slate-700"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />
        {thread.attachments?.length > 0 && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {thread.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.file_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-50"
              >
                {attachment.file_name || attachment.file_type}
              </a>
            ))}
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => likeMutation.mutate()} disabled={!user}>
            Like ({thread.like_count || 0})
          </Button>
          <Button variant="outline" onClick={() => bookmarkMutation.mutate()} disabled={!user}>
            Bookmark ({thread.bookmark_count || 0})
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!user) return
              const reason = window.prompt('Alasan report thread')
              if (!reason) return
              reportThreadMutation.mutate(reason)
            }}
            disabled={!user}
          >
            Report
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href)
              toast.success('Link thread disalin')
            }}
          >
            Share
          </Button>
        </div>
      </article>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Komentar</h2>
            <select
              value={commentSort}
              onChange={(event) => setCommentSort(event.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            >
              {COMMENT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {user ? (
            <div className="space-y-3">
              <RichTextEditor value={newComment} onChange={setNewComment} placeholder="Tulis komentar..." />
              <Button
                onClick={() => {
                  addCommentMutation.mutate({
                    threadId,
                    authorId: user.id,
                    content: newComment,
                  })
                  setNewComment('')
                }}
              >
                Kirim Komentar
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Login untuk menulis komentar.</p>
          )}
        </div>

        {commentsQuery.data.length === 0 ? (
          <EmptyState title="Belum ada komentar" description="Jadilah yang pertama berkomentar." />
        ) : (
          <div className="space-y-3">
            {commentsQuery.data.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onReply={(parentCommentId, content) =>
                  addCommentMutation.mutate({
                    threadId,
                    authorId: user.id,
                    content,
                    parentCommentId,
                  })
                }
                onEdit={(commentId, content) =>
                  editCommentMutation.mutateAsync({ commentId, content })
                }
                onDelete={(commentId) => deleteCommentMutation.mutate(commentId)}
                onReport={(commentId) => {
                  if (!user) return
                  const reason = window.prompt('Alasan report komentar')
                  if (!reason) return
                  reportCommentMutation.mutate({ commentId, reason })
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
