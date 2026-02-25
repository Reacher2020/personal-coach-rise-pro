import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface SurveyGuardProps {
  children: React.ReactNode;
}

export const SurveyGuard = ({ children }: SurveyGuardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasSurvey, setHasSurvey] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from('client_surveys')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      setHasSurvey(!!(data && data.length > 0));
      setLoading(false);
    };
    check();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasSurvey) {
    return <Navigate to="/client/onboarding" replace />;
  }

  return <>{children}</>;
};
