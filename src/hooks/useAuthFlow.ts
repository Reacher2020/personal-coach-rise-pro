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

  useEffect(() => {
    const init = async () => {
      try {
        // Sprawdź czy istnieje admin
        const { data: adminExists } = await supabase.rpc('admin_exists');
        if (!adminExists) setNoAdminExists(true);

        // Sprawdź token zaproszenia
        const token = searchParams.get('invite');
        if (token) setInviteToken(token);

        // Ustal flow
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
    if (!email || !password) {
      toast({ title: 'Błąd', description: 'Email i hasło są wymagane', variant: 'destructive' });
      return;
    }

    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({ title: 'Błąd', description: emailValidation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!passwordValidation.success) {
      toast({ title: 'Błąd', description: passwordValidation.error.errors[0].message, variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      toast({ title: 'Sukces', description: 'Zalogowano pomyślnie', variant: 'default' });
      navigate('/');
    } catch (e: any) {
      toast({ title: 'Błąd logowania', description: e.message, variant: 'destructive' });
    }
  };

  const handleSignup = async (email?: string, password?: string, name?: string) => {
    if (!email || !password) {
      toast({ title: 'Błąd', description: 'Email i hasło są wymagane', variant: 'destructive' });
      return;
    }

    const emailValidation = emailSchema.safeParse(email);
    const passwordValidation = passwordSchema.safeParse(password);

    if (!emailValidation.success) {
      toast({ title: 'Błąd', description: emailValidation.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!passwordValidation.success) {
      toast({ title: 'Błąd', description: passwordValidation.error.errors[0].message, variant: 'destructive' });
      return;
    }

    try {
      // Signup w Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name } },
      });

      if (error) throw error;

      // Dodatkowa walidacja invite: czy email już istnieje
      if (authFlow === 'invite') {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.trim())
          .single();

        if (existing) {
          toast({ title: 'Błąd', description: 'Email z zaproszenia już istnieje', variant: 'destructive' });
          return;
        }
      }

      toast({ title: 'Sukces', description: 'Konto utworzone pomyślnie', variant: 'default' });
      navigate('/');
    } catch (e: any) {
      toast({ title: 'Błąd rejestracji', description: e.message || 'Nie udało się utworzyć konta', variant: 'destructive' });
    }
  };

  return { authFlow, handleLogin, handleSignup, loading, inviteToken, noAdminExists };
};
