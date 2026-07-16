import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'

export function ProtectedRoute({ children, role }) {
  const { loading, isAuthenticated, role: userRole } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && userRole !== role) return <Navigate to="/" replace />
  return children
}
