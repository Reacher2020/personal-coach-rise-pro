import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, Loader2, Mail, UserPlus, Shield } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: 'Nieprawidłowy adres email' }).max(255);
const passwordSchema = z.string().min(6, { message: 'Hasło musi mieć minimum 6 znaków' }).max(72);
const nameSchema = z.string().trim().max(100).optional();

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, refetchRole } = useUserRole();
  const { getInvitationByToken, acceptInvitation } = useInvitations();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState(false);
  const [defaultTab, setDefaultTab] = useState('login');
  const [noAdminExists, setNoAdminExists] = useState(false);
  const [isAdminSetup, setIsAdminSetup] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if any admin exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const { data, error } = await supabase.rpc('admin_exists');
        if (!error) {
          setNoAdminExists(!data);
          if (!data) {
            setDefaultTab('signup');
          }
        }
      } catch (e) {
        // Function might not exist yet, ignore
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdminExists();
  }, []);

  // Check for invite token in URL
  useEffect(() => {
    const token = searchParams.get('invite');
    if (token) {
      setInviteToken(token);
      checkInvitation(token);
    }
  }, [searchParams]);

  const checkInvitation = async (token: string) => {
    const { data: invitation } = await getInvitationByToken(token);
    if (invitation) {
      setInviteRole(invitation.role);
      setInviteValid(true);
      setSignupEmail(invitation.email);
      setDefaultTab('signup');
    }
  };

  // Handle redirect after login based on role
  useEffect(() => {
    if (user && !authLoading && !roleLoading) {
      // If this is admin setup, handle it
      if (isAdminSetup && noAdminExists) {
        handleAdminSetup();
      } else if (inviteToken && inviteValid) {
        handleAcceptInvitation();
      } else if (role) {
        redirectBasedOnRole();
      }
    }
  }, [user, authLoading, roleLoading, role, isAdminSetup]);

  const handleAdminSetup = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('setup_first_admin', { target_user_id: user.id });
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: 'Administrator utworzony!',
          description: 'Twoje konto zostało skonfigurowane jako administrator.',
        });
        await refetchRole();
        setNoAdminExists(false);
        setIsAdminSetup(false);
        navigate('/admin', { replace: true });
      } else {
        toast({
          title: 'Błąd',
          description: 'Administrator już istnieje w systemie.',
          variant: 'destructive',
        });
        setIsAdminSetup(false);
      }
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      setIsAdminSetup(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!inviteToken) return;
    
    const { success } = await acceptInvitation(inviteToken);
    if (success) {
      await refetchRole();
      window.history.replaceState({}, '', '/auth');
      setInviteToken(null);
      setInviteValid(false);
    }
    redirectBasedOnRole();
  };

  const redirectBasedOnRole = () => {
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'coach') {
      navigate('/', { replace: true });
    } else if (role === 'client') {
      navigate('/client', { replace: true });
    } else {
      toast({
        title: 'Brak uprawnień',
        description: 'Twoje konto nie ma przypisanej roli. Skontaktuj się z administratorem.',
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(loginEmail);
    const passwordResult = passwordSchema.safeParse(loginPassword);
    
    if (!emailResult.success) {
      toast({ title: 'Błąd', description: emailResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!passwordResult.success) {
      toast({ title: 'Błąd', description: passwordResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(loginEmail.trim(), loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast({ title: 'Błąd logowania', description: 'Nieprawidłowy email lub hasło', variant: 'destructive' });
      } else {
        toast({ title: 'Błąd logowania', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Zalogowano!', description: 'Witaj z powrotem!' });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(signupEmail);
    const passwordResult = passwordSchema.safeParse(signupPassword);
    const nameResult = nameSchema.safeParse(signupName);
    
    if (!emailResult.success) {
      toast({ title: 'Błąd', description: emailResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!passwordResult.success) {
      toast({ title: 'Błąd', description: passwordResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    if (!nameResult.success) {
      toast({ title: 'Błąd', description: nameResult.error.errors[0].message, variant: 'destructive' });
      return;
    }

    // If this is admin setup, mark it
    if (noAdminExists && !inviteValid) {
      setIsAdminSetup(true);
    }
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail.trim(), signupPassword, signupName.trim() || undefined);
    setIsLoading(false);

    if (error) {
      setIsAdminSetup(false);
      if (error.message.includes('User already registered')) {
        toast({ title: 'Błąd rejestracji', description: 'Ten email jest już zarejestrowany', variant: 'destructive' });
      } else {
        toast({ title: 'Błąd rejestracji', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Konto utworzone!', description: noAdminExists ? 'Konfigurowanie administratora...' : 'Możesz się teraz zalogować' });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coach': return 'Trener';
      case 'client': return 'Klient';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSignupMode = noAdminExists || inviteValid || defaultTab === 'signup';
  const [showSignup, setShowSignup] = useState(isSignupMode);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Dumbbell className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Personal Trainer Pro</h1>
          <p className="text-slate-500">Zarządzaj swoimi klientami i treningami</p>
        </div>
      </div>

      {/* First Admin Setup Banner */}
      {noAdminExists && !inviteValid && (
        <Card className="w-full max-w-md mb-4 border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Konfiguracja początkowa</p>
              <p className="text-sm text-slate-500">
                Zarejestruj się, aby utworzyć konto <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Administratora</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invitation Banner */}
      {inviteValid && inviteRole && (
        <Card className="w-full max-w-md mb-4 border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Zaproszenie do rejestracji</p>
              <p className="text-sm text-slate-500">
                Zostałeś zaproszony jako <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{getRoleLabel(inviteRole)}</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card className="w-full max-w-md shadow-sm border-slate-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-semibold text-slate-800">
            {showSignup ? (noAdminExists ? 'Konfiguracja systemu' : 'Utwórz konto') : 'Witaj!'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {showSignup 
              ? (noAdminExists ? 'Utwórz pierwsze konto administratora' : 'Wypełnij formularz rejestracji')
              : 'Zaloguj się lub utwórz nowe konto'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {!showSignup ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-700">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-slate-700">Hasło</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logowanie...
                  </>
                ) : (
                  'Zaloguj się'
                )}
              </Button>
              <p className="text-center text-sm text-slate-500 mt-4">
                Nie masz konta?{' '}
                <button 
                  type="button"
                  onClick={() => setShowSignup(true)} 
                  className="text-sky-500 hover:text-sky-600 font-medium"
                >
                  Zarejestruj się
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-700">Imię i nazwisko</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-700">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={isLoading || inviteValid}
                  className="bg-slate-50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-700">Hasło</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimum 6 znaków"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {noAdminExists ? 'Tworzenie administratora...' : 'Tworzenie konta...'}
                  </>
                ) : (
                  noAdminExists && !inviteValid ? 'Utwórz konto administratora' : 'Utwórz konto'
                )}
              </Button>
              {!noAdminExists && !inviteValid && (
                <p className="text-center text-sm text-slate-500 mt-4">
                  Masz już konto?{' '}
                  <button 
                    type="button"
                    onClick={() => setShowSignup(false)} 
                    className="text-sky-500 hover:text-sky-600 font-medium"
                  >
                    Zaloguj się
                  </button>
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
