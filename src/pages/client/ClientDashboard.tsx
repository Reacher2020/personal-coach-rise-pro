import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  MessageSquare,
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch upcoming sessions for this client
      const { data: sessionsData } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      setUpcomingSessions(sessionsData || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const initials = (name: string | null) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FitCoach</span>
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              {initials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Witaj, {profile?.full_name || 'Kliencie'}!
          </h1>
          <p className="text-muted-foreground">
            Twój panel klienta
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
              <p className="text-sm text-muted-foreground">Nadchodzące sesje</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">0%</p>
              <p className="text-sm text-muted-foreground">Postęp</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                <Dumbbell className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Treningi</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Wiadomości</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Nadchodzące sesje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
            ) : upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak zaplanowanych sesji</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{session.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.scheduled_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.duration_minutes} min
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">{session.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-card border-border hover:shadow-glow transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Napisz do trenera</p>
                <p className="text-sm text-muted-foreground">Skontaktuj się z trenerem</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border hover:shadow-glow transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">Mój profil</p>
                <p className="text-sm text-muted-foreground">Edytuj dane osobowe</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
