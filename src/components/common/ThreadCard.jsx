import { Bookmark, Eye, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRelative } from '../../utils/date.js'
import { Avatar } from '../ui/Avatar.jsx'
import { Badge } from '../ui/Badge.jsx'
import { Button } from '../ui/Button.jsx'

export function ThreadCard({ thread, showActions = false, onLike, onBookmark }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge>{thread.categories?.name || 'Umum'}</Badge>
        <span className="text-xs text-slate-500">{formatRelative(thread.created_at)}</span>
      </div>
      <Link to={`/forum/${thread.id}`} className="block">
        <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-700">
          {thread.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600">{thread.excerpt}</p>
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar src={thread.profiles?.avatar_url} alt={thread.profiles?.username} size="sm" />
          <span className="text-sm text-slate-600">@{thread.profiles?.username || 'anonymous'}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} />
            {thread.comment_count || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={14} />
            {thread.like_count || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={14} />
            {thread.view_count || 0}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={onLike}>
            Like
          </Button>
          <Button size="sm" variant="outline" className="inline-flex items-center gap-1" onClick={onBookmark}>
            <Bookmark size={14} />
            Bookmark
          </Button>
        </div>
      )}
    </article>
  )
}
