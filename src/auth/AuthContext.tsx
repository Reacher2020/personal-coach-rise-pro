import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, fetchMe, logout } from './auth.api'

type User = {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
}

type AuthContextType = {
  user: User | null
  authResolved: boolean
  loginUser: (email: string, password: string) => Promise<void>
  logoutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const navigate = useNavigate()

  // INIT AUTH (zero flicker)
  useEffect(() => {
    let mounted = true

    fetchMe()
      .then(me => {
        if (mounted) setUser(me)
      })
      .finally(() => {
        if (mounted) setAuthResolved(true)
      })

    return () => {
      mounted = false
    }
  }, [])

  async function loginUser(email: string, password: string) {
    await login(email, password)

    const me = await fetchMe()
    if (!me) throw new Error('Auth not established')

    setUser(me)

    if (me.role === 'ADMIN') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  async function logoutUser() {
    await logout()
    setUser(null)
    navigate('/auth', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authResolved,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
