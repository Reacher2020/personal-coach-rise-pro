import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useInvitations } from '@/hooks/useInvitations';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Dumbbell, Loader2 } from 'lucide-react';

/* ================= VALIDATION ================= */

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);

/* ================= TYPES ================= */

type AuthFlow =
  | 'login'
  | 'signup'
  | 'invite'
  | 'setup-admin'
  | 'redirect';

/* ================= COMPONENT ================= */

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, refetchRole } = useUserRole();
  const { getInvitationByToken, acceptInvitation } = useInvitations();

  /* ================= UI STATE ================= */

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  /* ================= SYSTEM STATE ================= */

  const [noAdminExists, setNoAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const inviteToken = searchParams.get('invite');

  /* ================= ADMIN CHECK ================= */

  useEffect(() => {
    supabase
      .rpc('admin_exists')
      .then(({ data }) => {
        if (data === false) {
          setNoAdminExists(true);
          setTab('signup');
        }
      })
      .finally(() => setCheckingAdmin(false));
  }, []);

  /* ================= INVITE PREFILL ================= */

  useEffect(() => {
    if (!inviteToken) return;

    getInvitationByToken(inviteToken)
      .then(({ data }) => {
        if (!data) return;
        setSignupEmail(data.email);
        setTab('signup');
      })
      .catch(() =>
        toast({
          title: 'Błąd zaproszenia',
          description: 'Token jest nieprawidłowy lub wygasł',
          variant: 'destructive',
        })
      );
  }, [inviteToken]);

  /* ================= AUTH FLOW RESOLUTION ================= */

  const authFlow: AuthFlow = useMemo(() => {
    if (user && role) return 'redirect';
    if (user && inviteToken) return 'invite';
    if (user && noAdminExists) return 'setup-admin';
    return tab;
  }, [user, role, inviteToken, noAdminExists, tab]);

  /* ================= POST AUTH ORCHESTRATION ================= */

  useEffect(() => {
    if (authLoading || roleLoading || !user) return;

    const run = async () => {
      switch (authFlow) {
        case 'setup-admin':
          await supabase.rpc('setup_first_admin', {
            target_user_id: user.id,
          });
          await refetchRole();
          break;

        case 'invite':
          if (!role && inviteToken) {
            await acceptInvitation(inviteToken);
            await refetchRole();
            window.history.replaceState({}, '', '/auth');
          }
          break;

        case 'redirect':
          redirectByRole(role!);
          break;
      }
    };

    run().catch((e) =>
      toast({
        title: 'Błąd autoryzacji',
        description: e.message,
        variant: 'destructive',
      })
    );
  }, [authFlow, user, role]);

  /* ================= ACTIONS ================= */

  const redirectByRole = (r: string) => {
    const map: Record<string, string> = {
      admin: '/admin',
      coach: '/',
      client: '/client',
    };

    navigate(map[r] ?? '/auth', { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSchema.safeParse(loginEmail).success) return;

    setBusy(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    setBusy(false);

    if (error) {
      toast({ title: 'Błąd logowania', description: error.message });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !emailSchema.safeParse(signupEmail).success ||
      !passwordSchema.safeParse(signupPassword).success
    )
      return;

    setBusy(true);
    const { error } = await signUp(
      signupEmail.trim(),
      signupPassword,
      signupName || undefined,
      { setup_admin: noAdminExists && !inviteToken }
    );
    setBusy(false);

    if (error) {
      toast({ title: 'Błąd rejestracji', description: error.message });
    }
  };

  /* ================= LOADING ================= */

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="text-white" />
          </div>
          <CardTitle>Trener Personalny Pro</CardTitle>
          <CardDescription>
            {authFlow === 'invite'
              ? 'Akceptacja zaproszenia'
              : authFlow === 'setup-admin'
              ? 'Konfiguracja pierwszego administratora'
              : 'Logowanie lub rejestracja'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login" disabled={noAdminExists}>
                Logowanie
              </TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <Label>Email</Label>
                <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                <Label>Hasło</Label>
                <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <Button className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : 'Zaloguj'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input placeholder="Imię i nazwisko" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                <Input placeholder="Email" value={signupEmail} disabled={!!inviteToken} onChange={(e) => setSignupEmail(e.target.value)} />
                <Input type="password" placeholder="Hasło" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                <Button className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : 'Utwórz konto'}
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

