import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sidebar } from '../components/common/Sidebar.jsx'
import { ThreadCard } from '../components/common/ThreadCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { Pagination } from '../components/ui/Pagination.jsx'
import { SearchInput } from '../components/ui/SearchInput.jsx'
import { THREAD_SORT_OPTIONS } from '../constants/forum.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { useAuth } from '../hooks/useAuth.js'
import { getCategories } from '../services/categoryService.js'
import { getThreads, toggleBookmarkThread, toggleLikeThread } from '../services/threadService.js'
import { queryKeys } from '../utils/queryKeys.js'

export default function ForumPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(search, 300)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const page = Number(searchParams.get('page') || 1)
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: 10,
      category,
      sort,
      search: debouncedSearch,
    }),
    [page, category, sort, debouncedSearch],
  )

  const threadsQuery = useQuery({
    queryKey: queryKeys.forumThreads(queryParams),
    queryFn: () => getThreads(queryParams),
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })

  const likeMutation = useMutation({
    mutationFn: (threadId) => toggleLikeThread({ threadId, userId: user.id }),
    onSuccess: () => {
      toast.success('Aksi like berhasil')
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const bookmarkMutation = useMutation({
    mutationFn: (threadId) => toggleBookmarkThread({ threadId, userId: user.id }),
    onSuccess: () => {
      toast.success('Aksi bookmark berhasil')
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] })
    },
    onError: (error) => toast.error(error.message),
  })

  if (threadsQuery.isLoading || categoriesQuery.isLoading) return <LoadingSpinner />
  if (threadsQuery.isError) return <ErrorState message={threadsQuery.error.message} />
  if (categoriesQuery.isError) return <ErrorState message={categoriesQuery.error.message} />

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row">
        <Sidebar />
        <div className="flex-1 space-y-4">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSearchParams((current) => {
                    current.set('search', event.target.value)
                    current.set('page', '1')
                    return current
                  })
                }}
                placeholder="Cari thread..."
              />
            </div>
            <select
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              value={category}
              onChange={(event) =>
                setSearchParams((current) => {
                  if (event.target.value) {
                    current.set('category', event.target.value)
                  } else {
                    current.delete('category')
                  }
                  current.set('page', '1')
                  return current
                })
              }
            >
              <option value="">Semua Kategori</option>
              {categoriesQuery.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              value={sort}
              onChange={(event) =>
                setSearchParams((current) => {
                  current.set('sort', event.target.value)
                  current.set('page', '1')
                  return current
                })
              }
            >
              {THREAD_SORT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {threadsQuery.data.data.length === 0 ? (
            <EmptyState
              title="Thread tidak ditemukan"
              description="Ubah filter atau buat thread baru."
            />
          ) : (
            <div className="space-y-3">
              {threadsQuery.data.data.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  showActions={Boolean(user)}
                  onLike={() => likeMutation.mutate(thread.id)}
                  onBookmark={() => bookmarkMutation.mutate(thread.id)}
                />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={threadsQuery.data.totalPages}
            onChange={(nextPage) =>
              setSearchParams((current) => {
                current.set('page', String(nextPage))
                return current
              })
            }
          />
        </div>
      </div>

      <Link
        to="/forum/create"
        className="fixed right-6 bottom-6"
        aria-label="Create Thread"
      >
        <Button className="inline-flex items-center gap-2 rounded-full px-5 py-3 shadow-lg">
          <Plus size={16} />
          Create Thread
        </Button>
      </Link>
    </div>
  )
}
