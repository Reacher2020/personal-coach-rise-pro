import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe, login, registerFromInvite } from './auth.api'
import { navigateAfterAuth } from './navigateAfterAuth'

type User = {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
}

type AuthContextType = {
  user: User | null
  authResolved: boolean
  loginUser: (email: string, password: string) => Promise<void>
  registerInvite: (token: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .finally(() => setAuthResolved(true))
  }, [])

  async function loginUser(email: string, password: string) {
    const data = await login(email, password)
    setUser(data.user)
    navigateAfterAuth(data.user, navigate)
  }

  async function registerInvite(token: string, password: string) {
    const data = await registerFromInvite(token, password)
    setUser(data.user)
    navigateAfterAuth(data.user, navigate)
  }

  return (
    <AuthContext.Provider
      value={{ user, authResolved, loginUser, registerInvite }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
