import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function AuthGuard({ children }: { children: JSX.Element }) {
  const { user, authResolved } = useAuth()

  if (!authResolved) return null
  if (!user) return <Navigate to="/auth" replace />

  return children
}
