export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error('Invalid credentials')
  }

  return true
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
  })

  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}
