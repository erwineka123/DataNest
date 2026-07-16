import { Link } from 'react-router-dom'

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
      <h3 className="text-sm font-semibold text-slate-700">Navigasi</h3>
      <div className="mt-3 space-y-1 text-sm">
        <Link className="block rounded px-3 py-2 hover:bg-slate-100" to="/forum">
          Semua Thread
        </Link>
        <Link className="block rounded px-3 py-2 hover:bg-slate-100" to="/forum/create">
          Buat Thread
        </Link>
        <Link className="block rounded px-3 py-2 hover:bg-slate-100" to="/notifications">
          Notifikasi
        </Link>
        <Link className="block rounded px-3 py-2 hover:bg-slate-100" to="/settings">
          Pengaturan
        </Link>
      </div>
    </aside>
  )
}
