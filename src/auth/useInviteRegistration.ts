import { useEffect, useState } from 'react'
import { fetchInvite, InvitePayload } from './invite.service'

export function useInviteRegistration(token?: string) {
  const [invite, setInvite] = useState<InvitePayload | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetchInvite(token)
      .then(setInvite)
      .finally(() => setLoading(false))
  }, [token])

  return { invite, loading }
}
