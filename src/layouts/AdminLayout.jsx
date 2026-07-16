import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar.jsx'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container-main py-6">
        <Outlet />
      </main>
    </div>
  )
}
