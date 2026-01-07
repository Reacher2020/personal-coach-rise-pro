import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const AuthGuard = ({ children, allowedRoles = [], redirectTo = '/auth' }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      setUser(user);

      if (!user) {
        setLoading(false);
        navigate(redirectTo, { replace: true });
        return;
      }

      // pobierz rolę użytkownika
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setRole(roleData?.role || null);

      if (allowedRoles.length > 0 && !allowedRoles.includes(roleData?.role)) {
        navigate(redirectTo, { replace: true });
      }

      setLoading(false);
    };

    checkAuth();
  }, [allowedRoles, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
