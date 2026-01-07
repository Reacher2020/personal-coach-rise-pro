import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Dumbbell className="h-8 w-8 text-hero-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Trener Personalny Pro</h1>
          </div>
        </div>

        {/* First Admin Setup Banner */}
        {noAdminExists && !inviteValid && (
          <Card className="border-primary/50 bg-primary/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Konfiguracja początkowa</p>
                <p className="text-sm text-muted-foreground">
                  Zarejestruj się, aby utworzyć konto <Badge variant="secondary">Administratora</Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitation Banner */}
        {inviteValid && inviteRole && (
          <Card className="border-primary/50 bg-primary/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Zaproszenie do rejestracji</p>
                <p className="text-sm text-muted-foreground">
                  Zostałeś zaproszony jako <Badge variant="secondary">{getRoleLabel(inviteRole)}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              {noAdminExists && !inviteValid ? 'Konfiguracja systemu' : 'Witaj!'}
            </CardTitle>
            <CardDescription className="text-center">
              {noAdminExists && !inviteValid
                ? 'Utwórz pierwsze konto administratora'
                : inviteValid 
                  ? 'Utwórz konto, aby zaakceptować zaproszenie'
                  : 'Zaloguj się lub utwórz nowe konto'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} key={`${defaultTab}-${noAdminExists}`} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" disabled={noAdminExists && !inviteValid}>Logowanie</TabsTrigger>
                <TabsTrigger value="signup">Rejestracja</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Hasło</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logowanie...
                      </>
                    ) : (
                      'Zaloguj się'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Imię i nazwisko</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jan Kowalski"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading || inviteValid}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Hasło</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 znaków"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {noAdminExists ? 'Tworzenie administratora...' : 'Tworzenie konta...'}
                      </>
                    ) : (
                      noAdminExists && !inviteValid ? 'Utwórz konto administratora' : 'Utwórz konto'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
