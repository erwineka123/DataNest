import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-600">Halaman tidak ditemukan.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button>Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
