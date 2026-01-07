import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useInviteRegistration } from './useInviteRegistration'

export function Auth() {
  const [params] = useSearchParams()
  const inviteToken = params.get('invite') ?? undefined

  const { invite } = useInviteRegistration(inviteToken)
  const { loginUser, registerInvite } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isInvite = Boolean(inviteToken && invite)

  async function submit() {
    if (isInvite) {
      await registerInvite(inviteToken!, password)
    } else {
      await loginUser(email, password)
    }
  }

  return (
    <div>
      <h1>{isInvite ? 'Rejestracja' : 'Logowanie'}</h1>

      {isInvite ? (
        <input value={invite!.email} disabled />
      ) : (
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      )}

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit}>
        {isInvite ? 'Utwórz konto' : 'Zaloguj'}
      </button>
    </div>
  )
}
