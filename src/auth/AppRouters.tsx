import { Routes, Route } from 'react-router-dom'
import { Auth } from '../auth/Auth'
import { AuthGuard } from '../auth/AuthGuard'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/admin"
        element={
          <AuthGuard>
            <div>Admin panel</div>
          </AuthGuard>
        }
      />

      <Route
        path="/app"
        element={
          <AuthGuard>
            <div>User app</div>
          </AuthGuard>
        }
      />
    </Routes>
  )
}
