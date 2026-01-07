import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';

const emailSchema = z.string().trim().email('Nieprawidłowy email').max(255);
const passwordSchema = z.string().min(6, 'Min. 6 znaków').max(72);

export const useAuthFlow = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [noAdminExists, setNoAdminExists] = useState(false);
  const [authFlow, setAuthFlow] = useState<'login' | 'invite' | 'setup-admin'>('login');

  // 🔹 Pobieranie roli użytkownika i przekierowanie
  const redirectByRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const role = roleData?.role;
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'coach') navigate('/', { replace: true });
      else if (role === 'client') navigate('/client', { replace: true });
      else {
        toast({ title: 'Brak roli', description: 'Skontaktuj się z administratorem', variant: 'destructive' });
        navigate('/auth', { replace: true });
      }
    } catch (e: any) {
      toast({ title: 'Błąd', description: 'Nie udało się pobrać roli', variant: 'destructive' });
      navigate('/auth', { replace: true });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: adminExists } = await supabase.rpc('admin_exists');
        if (!adminExists) setNoAdminExists(true);

        const token = searchParams.get('invite');
        if (token) setInviteToken(token);

        if (!adminExists && !token) setAuthFlow('setup-admin');
        else if (token) setAuthFlow('invite');
        else setAuthFlow('login');
      } catch (e) {
        toast({ title: 'Błąd', description: 'Nie udało się ustalić stanu auth', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const handleLogin = async (email?: string, password?: string) => {
    if (!email || !password) return;

    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) return toast({ title: 'Błąd', description: emailValidation.error.errors[0].message, variant: 'destructive' });
    if (!passwordValidation.success) return toast({ title: 'Błąd', description: passwordValidation.error.errors[0].message, variant: 'destructive' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      if (data.user?.id) await redirectByRole(data.user.id);
    } catch (e: any) {
      toast({ title: 'Błąd logowania', description: e.message, variant: 'destructive' });
    }
  };

  const handleSignup = async (email?: string, password?: string, name?: string) => {
    if (!email || !password) return;

    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) return toast({ title: 'Błąd', description: emailValidation.error.errors[0].message, variant: 'destructive' });
    if (!passwordValidation.success) return toast({ title: 'Błąd', description: passwordValidation.error.errors[0].message, variant: 'destructive' });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;

      if (data.user?.id) await redirectByRole(data.user.id);
    } catch (e: any) {
      toast({ title: 'Błąd rejestracji', description: e.message || 'Nie udało się utworzyć konta', variant: 'destructive' });
    }
  };

  return { authFlow, handleLogin, handleSignup, loading, inviteToken, noAdminExists };
};
