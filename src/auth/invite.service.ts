export interface InvitePayload {
  email: string
  role: 'ADMIN' | 'USER'
  organizationId: string
}

export async function fetchInvite(token: string): Promise<InvitePayload> {
  const res = await fetch(`/api/invites/${token}`)

  if (!res.ok) {
    throw new Error('Invalid or expired invite')
  }

  return res.json()
}
