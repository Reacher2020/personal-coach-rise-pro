import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { AuthGuard } from '@/auth/AuthGuard'

import AuthPage from '@/pages/Auth'
import AppPage from '@/pages/App'
import AdminPage from '@/pages/Admin'

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC */}
        <Route path="/auth" element={<AuthPage />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminPage />
            </AuthGuard>
          }
        />

        {/* USER */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppPage />
            </AuthGuard>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
