export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function registerFromInvite(
  token: string,
  password: string
) {
  const res = await fetch('/api/auth/register-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  if (!res.ok) throw new Error('Invite registration failed')
  return res.json() // { user }
}

export async function fetchMe() {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  return res.json()
}
