import { useState } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Dumbbell } from 'lucide-react';

const Auth = () => {
  const { authFlow, handleLogin, handleSignup, loading } = useAuthFlow();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
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
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="signup">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(loginEmail, loginPassword);
                }}
              >
                <Label>Email</Label>
                <Input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                <Label>Hasło</Label>
                <Input placeholder="Hasło" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                <Button className="w-full">Zaloguj</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup(signupEmail, signupPassword, signupName);
                }}
              >
                <Input placeholder="Imię i nazwisko" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                <Input placeholder="twoj@email.pl" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                <Input type="*******" placeholder="Hasło" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                <Button className="w-full">Utwórz konto</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

