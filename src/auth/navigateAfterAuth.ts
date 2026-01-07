import { NavigateFunction } from 'react-router-dom'

export function navigateAfterAuth(
  user: { role: string },
  navigate: NavigateFunction
) {
  if (user.role === 'ADMIN') {
    navigate('/admin', { replace: true })
  } else {
    navigate('/app', { replace: true })
  }
}
