// src/pages/Auth.tsx

import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'

export default function AuthPage() {
  const { loginUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await loginUser(email, password)
    } catch {
      setError('Nieprawidłowy email lub hasło')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-80 space-y-4">
        <h1 className="text-xl font-semibold text-center">Logowanie</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button disabled={loading} type="submit">
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>
    </div>
  )
}
