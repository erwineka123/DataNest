import { Bell, CircleUserRound, LogOut, Menu, PlusCircle } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '../ui/Button.jsx'

export function Navbar() {
  const { isAuthenticated, profile, logout, role } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-main flex h-16 items-center justify-between">
        <Link to="/" className="text-lg font-bold text-blue-700">
          DataNest
        </Link>

        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          <Menu size={18} />
        </button>

        <nav
          className={`absolute left-0 right-0 top-16 border-b border-slate-200 bg-white p-4 md:static md:flex md:items-center md:gap-2 md:border-none md:bg-transparent md:p-0 ${open ? 'block' : 'hidden md:flex'}`}
        >
          <NavLink to="/" className="block rounded px-3 py-2 text-sm hover:bg-slate-100">
            Dashboard
          </NavLink>
          <NavLink to="/forum" className="block rounded px-3 py-2 text-sm hover:bg-slate-100">
            Forum
          </NavLink>
          <div className="mt-3 flex gap-2 md:mt-0 md:ml-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/forum/create">
                  <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5">
                    <PlusCircle size={16} />
                    Thread
                  </Button>
                </Link>
                <Link to="/notifications" className="rounded p-2 hover:bg-slate-100">
                  <Bell size={18} />
                </Link>
                <Link
                  to={profile?.username ? `/profile/${profile.username}` : '/settings'}
                  className="rounded p-2 hover:bg-slate-100"
                >
                  <CircleUserRound size={18} />
                </Link>
                {role === 'admin' && (
                  <Link to="/admin">
                    <Button size="sm" variant="outline">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex items-center gap-1.5"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
