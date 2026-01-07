import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(6);

type AuthFlow = 'login' | 'invite' | 'setup-admin';

export const useAuthFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('login');

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);

  /* ================= INVITE / FIRST ADMIN CHECK ================= */

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const invite = searchParams.get('invite');

      // 1️⃣ Zaproszenie
      if (invite) {
        const { data, error } = await supabase
          .from('invitations')
          .select('email')
          .eq('token', invite)
          .single();

        if (!error && data?.email) {
          setInviteToken(invite);
          setInviteEmail(data.email);
          setAuthFlow('invite');
          setLoading(false);
          return;
        }
      }

      // 2️⃣ Pierwszy admin
      const { data: adminExists } = await supabase.rpc('admin_exists');
      if (adminExists === false) {
        setAuthFlow('setup-admin');
        setLoading(false);
        return;
      }

      // 3️⃣ Normalne logowanie
      setAuthFlow('login');
      setLoading(false);
    };

    init();
  }, [searchParams]);

  /* ================= LOGIN ================= */

  const handleLogin = async (email?: string, password?: string) => {
    if (!email || !password) return;

    if (!emailSchema.safeParse(email).success)
      return toast({ title: 'Błąd', description: 'Nieprawidłowy email', variant: 'destructive' });

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      await redirectByRole();
    } catch (e: any) {
      toast({ title: 'Błąd logowania', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  /* ================= SIGNUP ================= */

  const handleSignup = async (email?: string, password?: string, name?: string) => {
    if (!email || !password) return;

    if (!emailSchema.safeParse(email).success)
      return toast({ title: 'Błąd', description: 'Nieprawidłowy email', variant: 'destructive' });

    if (!passwordSchema.safeParse(password).success)
      return toast({ title: 'Błąd', description: 'Hasło min. 6 znaków', variant: 'destructive' });

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) throw error;

      if (inviteToken) {
        await supabase.rpc('accept_invitation', { token: inviteToken });
      }

      await redirectByRole();
    } catch (e: any) {
      toast({ title: 'Błąd rejestracji', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  /* ================= REDIRECT ================= */

  const redirectByRole = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (data?.role === 'admin') navigate('/admin', { replace: true });
    else if (data?.role === 'coach') navigate('/', { replace: true });
    else if (data?.role === 'client') navigate('/client', { replace: true });
    else navigate('/auth', { replace: true });
  };

  return {
    authFlow,
    loading,
    handleLogin,
    handleSignup,
    inviteToken,
    inviteEmail,
  };
};
