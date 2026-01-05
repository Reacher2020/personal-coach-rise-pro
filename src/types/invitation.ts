export type InvitationStatus = 'pending' | 'accepted' | 'expired';
export type InvitationRole = 'coach' | 'client' | 'admin';

export interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  token: string;
  created_at: string;
  expires_at: string;
}
