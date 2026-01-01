import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: 'Nieprawidłowy adres email' }).max(255);
const passwordSchema = z.string().min(6, { message: 'Hasło musi mieć minimum 6 znaków' }).max(72);
const nameSchema = z.string().trim().max(100).optional();

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

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
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail.trim(), signupPassword, signupName.trim() || undefined);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast({ title: 'Błąd rejestracji', description: 'Ten email jest już zarejestrowany', variant: 'destructive' });
      } else {
        toast({ title: 'Błąd rejestracji', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Konto utworzone!', description: 'Możesz się teraz zalogować' });
    }
  };

  if (authLoading) {
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
            <h1 className="text-2xl font-bold text-foreground">Personal Trainer Pro</h1>
            <p className="text-muted-foreground">Zarządzaj swoimi klientami i treningami</p>
          </div>
        </div>

        <Card className="border-border shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Witaj!</CardTitle>
            <CardDescription className="text-center">
              Zaloguj się lub utwórz nowe konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Logowanie</TabsTrigger>
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
                      disabled={isLoading}
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
                        Tworzenie konta...
                      </>
                    ) : (
                      'Utwórz konto'
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
