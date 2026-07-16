import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { Input } from '../components/ui/Input.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { Tabs } from '../components/ui/Tabs.jsx'
import {
  createCategory,
  deleteCategoryAsAdmin,
  deleteCommentAsAdmin,
  deleteThreadAsAdmin,
  getAdminCategories,
  getAdminComments,
  getAdminReports,
  getAdminStats,
  getAdminThreads,
  getAdminUsers,
  updateUserRole,
} from '../services/adminService.js'
import { formatDate } from '../utils/date.js'
import { queryKeys } from '../utils/queryKeys.js'

const adminTabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'users', label: 'Users' },
  { value: 'threads', label: 'Threads' },
  { value: 'comments', label: 'Comments' },
  { value: 'categories', label: 'Categories' },
  { value: 'reports', label: 'Reports' },
]

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
})

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview')
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  })
  const queryClient = useQueryClient()
  const statsQuery = useQuery({ queryKey: queryKeys.adminStats, queryFn: getAdminStats })
  const usersQuery = useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: getAdminUsers,
    enabled: tab === 'users',
  })
  const reportsQuery = useQuery({
    queryKey: queryKeys.adminReports,
    queryFn: getAdminReports,
    enabled: tab === 'reports',
  })
  const threadsQuery = useQuery({
    queryKey: ['admin-threads'],
    queryFn: getAdminThreads,
    enabled: tab === 'threads',
  })
  const commentsQuery = useQuery({
    queryKey: ['admin-comments'],
    queryFn: getAdminComments,
    enabled: tab === 'comments',
  })
  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getAdminCategories,
    enabled: tab === 'categories',
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole({ userId, role }),
    onSuccess: () => {
      toast.success('Role pengguna diperbarui')
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteThreadMutation = useMutation({
    mutationFn: (threadId) => deleteThreadAsAdmin(threadId),
    onSuccess: () => {
      toast.success('Thread dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-threads'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteCommentAsAdmin(commentId),
    onSuccess: () => {
      toast.success('Komentar dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
    onError: (error) => toast.error(error.message),
  })

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      toast.success('Kategori ditambahkan')
      setCategoryForm({ name: '', slug: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => deleteCategoryAsAdmin(categoryId),
    onSuccess: () => {
      toast.success('Kategori dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    },
    onError: (error) => toast.error(error.message),
  })

  if (statsQuery.isLoading) return <LoadingSpinner />
  if (statsQuery.isError) return <ErrorState message={statsQuery.error.message} />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <Tabs tabs={adminTabs} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Users" value={statsQuery.data.totalUsers} />
          <StatCard title="Total Threads" value={statsQuery.data.totalThreads} />
          <StatCard title="Active Users" value={statsQuery.data.activeUsers} />
          <StatCard title="Total Comments" value={statsQuery.data.totalComments} />
          <StatCard title="Reported Posts" value={statsQuery.data.reportedPosts} />
        </div>
      )}

      {tab === 'users' && (
        <EntityTable
          loading={usersQuery.isLoading}
          error={usersQuery.error}
          headers={['Username', 'Role', 'Terdaftar', 'Aksi']}
          rows={(usersQuery.data ?? []).map((item) => [
            `@${item.username}`,
            item.role,
            formatDate(item.created_at),
            <div key={item.id} className="flex gap-2">
              <button
                type="button"
                className="cursor-pointer rounded bg-slate-200 px-2 py-1 text-xs"
                onClick={() => roleMutation.mutate({ userId: item.id, role: 'user' })}
              >
                User
              </button>
              <button
                type="button"
                className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs text-white"
                onClick={() => roleMutation.mutate({ userId: item.id, role: 'admin' })}
              >
                Admin
              </button>
            </div>,
          ])}
        />
      )}

      {tab === 'threads' && (
        <EntityTable
          loading={threadsQuery.isLoading}
          error={threadsQuery.error}
          headers={['Judul', 'Author', 'Kategori', 'Stat', 'Aksi']}
          rows={(threadsQuery.data ?? []).map((item) => [
            item.title,
            `@${item.profiles?.username}`,
            item.categories?.name || '-',
            `💬 ${item.comment_count} · ❤️ ${item.like_count} · 👁️ ${item.view_count}`,
            <button
              key={item.id}
              type="button"
              className="cursor-pointer rounded bg-red-600 px-2 py-1 text-xs text-white"
              onClick={() => deleteThreadMutation.mutate(item.id)}
            >
              Hapus
            </button>,
          ])}
        />
      )}

      {tab === 'comments' && (
        <EntityTable
          loading={commentsQuery.isLoading}
          error={commentsQuery.error}
          headers={['Komentar', 'Author', 'Thread', 'Aksi']}
          rows={(commentsQuery.data ?? []).map((item) => [
            item.content.replace(/<[^>]+>/g, ' ').slice(0, 70),
            `@${item.profiles?.username}`,
            item.threads?.title,
            <button
              key={item.id}
              type="button"
              className="cursor-pointer rounded bg-red-600 px-2 py-1 text-xs text-white"
              onClick={() => deleteCommentMutation.mutate(item.id)}
            >
              Hapus
            </button>,
          ])}
        />
      )}

      {tab === 'categories' && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault()
              const parsed = categorySchema.safeParse(categoryForm)
              if (!parsed.success) {
                toast.error('Nama dan slug kategori wajib diisi')
                return
              }
              createCategoryMutation.mutate(parsed.data)
            }}
          >
            <Input
              label="Nama"
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((value) => ({ ...value, name: event.target.value }))
              }
            />
            <Input
              label="Slug"
              value={categoryForm.slug}
              onChange={(event) =>
                setCategoryForm((value) => ({ ...value, slug: event.target.value }))
              }
            />
            <Input
              label="Deskripsi"
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((value) => ({ ...value, description: event.target.value }))
              }
            />
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white md:col-span-3 md:w-max"
            >
              Tambah Kategori
            </button>
          </form>

          <EntityTable
            loading={categoriesQuery.isLoading}
            error={categoriesQuery.error}
            headers={['Nama', 'Slug', 'Deskripsi', 'Aksi']}
            rows={(categoriesQuery.data ?? []).map((item) => [
              item.name,
              item.slug,
              item.description || '-',
              <button
                key={item.id}
                type="button"
                className="cursor-pointer rounded bg-red-600 px-2 py-1 text-xs text-white"
                onClick={() => deleteCategoryMutation.mutate(item.id)}
              >
                Hapus
              </button>,
            ])}
          />
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {reportsQuery.isLoading ? (
            <LoadingSpinner />
          ) : reportsQuery.isError ? (
            <ErrorState message={reportsQuery.error.message} />
          ) : (
            reportsQuery.data.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-800">{item.report_reason}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Oleh @{item.profiles?.username} · {formatDate(item.created_at)} · {item.status}
                </p>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  )
}

function EntityTable({ loading, error, headers, rows }) {
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error.message} />

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-200">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
