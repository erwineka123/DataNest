import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout.jsx'
import { MainLayout } from '../layouts/MainLayout.jsx'
import { AdminLayout } from '../layouts/AdminLayout.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'

const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx'))
const ForumPage = lazy(() => import('../pages/ForumPage.jsx'))
const ThreadDetailPage = lazy(() => import('../pages/ThreadDetailPage.jsx'))
const CreateThreadPage = lazy(() => import('../pages/CreateThreadPage.jsx'))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx'))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'))
const SettingsPage = lazy(() => import('../pages/SettingsPage.jsx'))
const NotificationsPage = lazy(() => import('../pages/NotificationsPage.jsx'))
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage.jsx'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'))

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:threadId" element={<ThreadDetailPage />} />
          <Route
            path="/forum/create"
            element={
              <ProtectedRoute>
                <CreateThreadPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
