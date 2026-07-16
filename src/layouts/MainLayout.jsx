import { Outlet } from 'react-router-dom'
import { Footer } from '../components/common/Footer.jsx'
import { Navbar } from '../components/common/Navbar.jsx'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container-main py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
