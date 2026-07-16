import { useState } from 'react'
import { formatRelative } from '../../utils/date.js'
import { Avatar } from '../ui/Avatar.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'

export function CommentCard({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReport,
}) {
  const [replyContent, setReplyContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content || '')
  const [replyOpen, setReplyOpen] = useState(false)

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar src={comment.profiles?.avatar_url} alt={comment.profiles?.username} size="sm" />
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              @{comment.profiles?.username || 'user'}
            </p>
            <span className="text-xs text-slate-500">{formatRelative(comment.created_at)}</span>
          </div>
          {editing ? (
            <div className="space-y-2">
              <Input
                value={editContent.replace(/<[^>]+>/g, ' ')}
                onChange={(event) => setEditContent(event.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(comment.id, editContent).then(() => setEditing(false))}>
                  Simpan
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          )}
          <div className="mt-3 flex gap-2">
            {currentUserId && (
              <Button size="sm" variant="outline" onClick={() => setReplyOpen((value) => !value)}>
                Balas
              </Button>
            )}
            {currentUserId === comment.author_id && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(comment.id)}>
                  Hapus
                </Button>
              </>
            )}
            {currentUserId && currentUserId !== comment.author_id && (
              <Button size="sm" variant="outline" onClick={() => onReport(comment.id)}>
                Report
              </Button>
            )}
          </div>
          {currentUserId && replyOpen && (
            <div className="mt-3 space-y-2">
              <Input
                value={replyContent}
                onChange={(event) => setReplyContent(event.target.value)}
                placeholder="Tulis balasan..."
              />
              <Button
                size="sm"
                onClick={() => {
                  onReply(comment.id, replyContent)
                  setReplyContent('')
                  setReplyOpen(false)
                }}
              >
                Kirim Balasan
              </Button>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="space-y-3 border-l border-slate-200 pl-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}
