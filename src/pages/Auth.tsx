import { useState, useEffect } from 'react';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Dumbbell, UserPlus, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Auth = () => {
  const { authFlow, handleLogin, handleSignup, loading, inviteToken } = useAuthFlow();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  useEffect(() => {
    if (authFlow === 'invite' && inviteToken) setSignupEmail(inviteToken);
  }, [authFlow, inviteToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const isSignup = authFlow === 'invite' || authFlow === 'setup-admin';
  const title = isSignup ? 'Rejestracja' : 'Logowanie';

  const description = isSignup
    ? 'Utwórz konto, aby kontynuować'
    : 'Zaloguj się';

  const getBadge = () => {
    if (authFlow === 'setup-admin') return <Badge variant="destructive">Pierwszy Admin</Badge>;
    if (authFlow === 'invite') return <Badge variant="secondary">Zaproszenie</Badge>;
    return <Badge variant="outline">Logowanie</Badge>;
  };

  const getIcon = () => {
    if (authFlow === 'setup-admin') return <Shield className="text-white h-6 w-6" />;
    if (authFlow === 'invite') return <UserPlus className="text-white h-6 w-6" />;
    return <Dumbbell className="text-white h-6 w-6" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
            {getIcon()}
          </div>
          <CardTitle>{title}</CardTitle>
          <div className="flex justify-center my-2">{getBadge()}</div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          {isSignup ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignup(signupEmail, signupPassword, signupName);
              }}
            >
              <Input placeholder="Imię i nazwisko" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              <Input
                placeholder="Email"
                value={signupEmail}
                disabled={!!inviteToken}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Hasło"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <Button className="w-full">Utwórz konto</Button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(loginEmail, loginPassword);
              }}
            >
              <Input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <Input
                type="password"
                placeholder="Hasło"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Button className="w-full">Zaloguj</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
