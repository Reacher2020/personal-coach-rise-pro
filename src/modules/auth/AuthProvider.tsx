import React, { createContext, useContext, useEffect, useState } from "react"

export type UserRole = "trainer" | "client"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TEMP: bez supabase – stabilizacja renderu
    // Supabase wróci w następnym kroku
    setUser({
      id: "debug",
      email: "debug@local",
      role: "trainer",
    })
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
