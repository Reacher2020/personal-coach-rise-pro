import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dumbbell,
  Loader2,
  UserPlus,
  Shield,
} from 'lucide-react';
import { z } from 'zod';

/* -------------------- schemas -------------------- */
const emailSchema = z.string().trim().email('Nieprawidłowy adres email').max(255);
const passwordSchema = z.string().min(6, 'Hasło musi mieć minimum 6 znaków').max(72);
const nameSchema = z.string().trim().max(100).optional();

/* -------------------- component -------------------- */
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, refetchRole } = useUserRole();
  const { getInvitationByToken, acceptInvitation } = useInvitations();

  /* -------------------- state -------------------- */
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState(false);

  const [noAdminExists, setNoAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdminSetup, setIsAdminSetup] = useState(false);

  /* 🔒 guard przeciwko wielokrotnym redirectom */
  const postAuthHandled = useRef(false);

  /* -------------------- check admin -------------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await supabase.rpc('admin_exists');
        if (data === false) {
          setNoAdminExists(true);
          setTab('signup');
        }
      } catch {
        // brak funkcji – ignorujemy (dev)
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  /* -------------------- invitation -------------------- */
  useEffect(() => {
    const token = searchParams.get('invite');
    if (!token) return;

    const check = async () => {
      try {
        const { data } = await getInvitationByToken(token);
        if (!data) return;

        setInviteToken(token);
        setInviteRole(data.role);
        setInviteValid(true);
        setSignupEmail(data.email);
        setTab('signup');
      } catch {
        toast({
          title: 'Błąd zaproszenia',
          description: 'Nie udało się zweryfikować zaproszenia',
          variant: 'destructive',
        });
      }
    };

    check();
  }, [searchParams]);

  /* -------------------- post auth flow -------------------- */
  useEffect(() => {
    if (
      postAuthHandled.current ||
      !user ||
      authLoading ||
      roleLoading
    ) return;

    postAuthHandled.current = true;

    const run = async () => {
      if (isAdminSetup && noAdminExists) {
        await setupFirstAdmin();
        return;
      }

      if (inviteToken && inviteValid) {
        await acceptInvite();
        return;
      }

      if (role) {
        redirectByRole(role);
      }
    };

    run();
  }, [user, authLoading, roleLoading, role, isAdminSetup]);

  /* -------------------- handlers -------------------- */
  const setupFirstAdmin = async () => {
    try {
      const { error } = await supabase.rpc('setup_first_admin', {
        target_user_id: user!.id,
      });
      if (error) throw error;

      await refetchRole();
      navigate('/admin', { replace: true });
    } catch (e: any) {
      toast({
        title: 'Błąd konfiguracji admina',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const acceptInvite = async () => {
    if (!inviteToken) return;

    const { success } = await acceptInvitation(inviteToken);
    if (!success) return;

    await refetchRole();
    window.history.replaceState({}, '', '/auth');
    redirectByRole(role);
  };

  const redirectByRole = (r: string | null) => {
    if (r === 'admin') navigate('/admin', { replace: true });
    else if (r === 'coach') navigate('/', { replace: true });
    else if (r === 'client') navigate('/client', { replace: true });
    else {
      toast({
        title: 'Brak roli',
        description: 'Skontaktuj się z administratorem',
        variant: 'destructive',
      });
    }
  };

  /* -------------------- login -------------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailSchema.safeParse(loginEmail).success) {
      toast({ title: 'Błąd', description: 'Nieprawidłowy email', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    setIsLoading(false);

    if (error) {
      toast({ title: 'Błąd logowania', description: error.message, variant: 'destructive' });
    }
  };

  /* -------------------- signup -------------------- */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailSchema.safeParse(signupEmail).success) return;
    if (!passwordSchema.safeParse(signupPassword).success) return;

    if (noAdminExists && !inviteValid) {
      setIsAdminSetup(true);
    }

    setIsLoading(true);
    const { error } = await signUp(
      signupEmail.trim(),
      signupPassword,
      signupName || undefined,
      { setup_admin: noAdminExists && !inviteValid }
    );
    setIsLoading(false);

    if (error) {
      setIsAdminSetup(false);
      toast({ title: 'Błąd rejestracji', description: error.message, variant: 'destructive' });
    }
  };

  /* -------------------- render -------------------- */
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="text-white" />
          </div>
          <CardTitle>Trener Personalny Pro</CardTitle>
          <CardDescription>
            {inviteValid
              ? 'Utwórz konto, aby zaakceptować zaproszenie'
              : noAdminExists
              ? 'Konfiguracja pierwszego administratora'
              : 'Zaloguj się lub utwórz konto'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login" disabled={noAdminExists && !inviteValid}>
                Logowanie
              </TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                <Input type="password" placeholder="Hasło" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Zaloguj'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input placeholder="Imię i nazwisko" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                <Input placeholder="Email" value={signupEmail} disabled={inviteValid} onChange={(e) => setSignupEmail(e.target.value)} />
                <Input type="password" placeholder="Hasło" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Utwórz konto'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
