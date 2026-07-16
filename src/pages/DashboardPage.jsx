import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ThreadCard } from '../components/common/ThreadCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { getDashboardData } from '../services/threadService.js'
import { queryKeys } from '../utils/queryKeys.js'

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardData,
  })

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorState message={error.message} />

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white">
        <h1 className="text-3xl font-bold">Modern Community Discussion Forum</h1>
        <p className="mt-3 max-w-2xl text-sm text-blue-50">
          Diskusi teknis, berbagi wawasan, dan membangun komunitas bersama.
        </p>
        <Link to="/forum" className="mt-5 inline-block">
          <Button size="lg" variant="outline" className="border-white text-black hover:bg-blue-700">
            Masuk Forum
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Threads</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.stats.totalThreads}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Comments</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{data.stats.totalComments}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Trending Threads</h2>
        {data.trendingThreads.length === 0 ? (
          <EmptyState title="Belum ada thread" description="Mulai thread pertama sekarang." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.trendingThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Latest Threads</h2>
        {data.latestThreads.length === 0 ? (
          <EmptyState title="Belum ada thread terbaru" description="Belum ada aktivitas terbaru." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.latestThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {data.categories.map((category) => (
            <Link
              key={category.id}
              to={`/forum?category=${category.id}`}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm hover:bg-slate-200"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
