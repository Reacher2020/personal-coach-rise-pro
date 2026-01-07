import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';

export type AuthFlow =
  | 'login'
  | 'signup'
  | 'invite'
  | 'setup-admin'
  | 'redirect'
  | 'loading';

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, refetchRole } = useUserRole();
  const { getInvitationByToken, acceptInvitation } = useInvitations();

  const inviteToken = searchParams.get('invite');
  const [noAdminExists, setNoAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  /* ================= CHECK ADMIN ================= */
  useEffect(() => {
    supabase
      .rpc('admin_exists')
      .then(({ data }) => {
        if (data === false) setNoAdminExists(true);
      })
      .finally(() => setCheckingAdmin(false));
  }, []);

  /* ================= INVITE PREFILL ================= */
  useEffect(() => {
    if (!inviteToken) return;

    getInvitationByToken(inviteToken)
      .then(({ data }) => {
        if (!data) throw new Error('Nieprawidłowy token zaproszenia');
      })
      .catch(() =>
        toast({
          title: 'Błąd zaproszenia',
          description: 'Token jest nieprawidłowy lub wygasł',
          variant: 'destructive',
        })
      );
  }, [inviteToken]);

  /* ================= DETERMINE FLOW ================= */
  const authFlow: AuthFlow = useMemo(() => {
    if (authLoading || roleLoading || checkingAdmin) return 'loading';

    if (!user) {
      if (noAdminExists) return 'signup';       // pierwszy admin
      if (inviteToken) return 'invite';        // zaproszenie
      return 'login';                          // zwykły login
    }

    if (user && inviteToken) return 'invite';
    if (user && noAdminExists) return 'setup-admin';
    if (user && role) return 'redirect';

    return 'login';
  }, [user, role, authLoading, roleLoading, checkingAdmin, noAdminExists, inviteToken]);

  /* ================= POST AUTH ACTIONS ================= */
  useEffect(() => {
    if (!user || authFlow === 'login' || authFlow === 'signup' || authFlow === 'loading') return;

    const run = async () => {
      try {
        if (authFlow === 'setup-admin') {
          await supabase.rpc('setup_first_admin', { target_user_id: user.id });
          await refetchRole();
        }

        if (authFlow === 'invite' && inviteToken) {
          await acceptInvitation(inviteToken);
          await refetchRole();
          window.history.replaceState({}, '', '/auth');
        }

        if (authFlow === 'redirect' && role) {
          const map: Record<string, string> = {
            admin: '/admin',
            coach: '/',
            client: '/client',
          };
          navigate(map[role] ?? '/auth', { replace: true });
        }
      } catch (e: any) {
        toast({ title: 'Błąd autoryzacji', description: e.message, variant: 'destructive' });
      }
    };

    run();
  }, [authFlow, user, role, inviteToken]);

  /* ================= LOGIN / SIGNUP ================= */
  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) return;
    const { error } = await signIn(email.trim(), password);
    if (error) toast({ title: 'Błąd logowania', description: error.message });
  };

  const handleSignup = async (email: string, password: string, name?: string) => {
    if (!email || !password) return;
    const { error } = await signUp(email.trim(), password, name, {
      setup_admin: noAdminExists && !inviteToken,
    });
    if (error) toast({ title: 'Błąd rejestracji', description: error.message });
  };

  return { authFlow, handleLogin, handleSignup, loading: authFlow === 'loading', inviteToken, noAdminExists };
};
