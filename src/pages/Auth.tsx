import { useEffect, useState } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Dumbbell, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Auth = () => {
  const {
    authFlow,
    loading,
    handleLogin,
    handleSignup,
    inviteEmail,
  } = useAuthFlow();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (authFlow === 'invite' && inviteEmail) {
      setEmail(inviteEmail); // ✅ POPRAWNE ŹRÓDŁO EMAILA
    }
  }, [authFlow, inviteEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isSignup = authFlow !== 'login';

  const icon =
    authFlow === 'setup-admin' ? <Shield className="text-white" /> :
    authFlow === 'invite' ? <UserPlus className="text-white" /> :
    <Dumbbell className="text-white" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            {icon}
          </div>

          <CardTitle>{isSignup ? 'Rejestracja' : 'Logowanie'}</CardTitle>

          {authFlow === 'setup-admin' && <Badge variant="destructive">Pierwszy Admin</Badge>}
          {authFlow === 'invite' && <Badge variant="secondary">Zaproszenie</Badge>}

          <CardDescription>
            {isSignup ? 'Utwórz konto, aby kontynuować' : 'Zaloguj się'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isSignup ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignup(email, password, name);
              }}
            >
              <Input placeholder="Imię i nazwisko" value={name} onChange={(e) => setName(e.target.value)} />
              <Input value={email} disabled={authFlow === 'invite'} />
              <Input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button className="w-full">Utwórz konto</Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(email, password);
              }}
            >
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button className="w-full">Zaloguj</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
