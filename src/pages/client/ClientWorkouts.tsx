import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  notes: string | null;
}

export default function ClientWorkouts() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('invited_by')
        .eq('user_id', user.id)
        .single();

      if (!profile?.invited_by) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('coach_id', profile.invited_by)
        .order('scheduled_at', { ascending: false });

      if (data) {
        setSessions(data);
      }

      setLoading(false);
    };

    fetchWorkouts();
  }, [user]);

  // Group sessions by type
  const sessionsByType = sessions.reduce((acc, session) => {
    const type = session.type || 'Inne';
    if (!acc[type]) acc[type] = [];
    acc[type].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const totalMinutes = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moje treningi</h1>
          <p className="text-muted-foreground mt-1">Przegląd Twoich planów treningowych</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Ukończone treningi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedSessions}</div>
                  <p className="text-sm text-muted-foreground">z {totalSessions} zaplanowanych</p>
                  <Progress value={completionRate} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Czas treningów
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(totalMinutes / 60)}h</div>
                  <p className="text-sm text-muted-foreground">{totalMinutes} minut łącznie</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Wskaźnik ukończenia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completionRate}%</div>
                  <p className="text-sm text-muted-foreground">wszystkich sesji</p>
                </CardContent>
              </Card>
            </div>

            {/* Workouts by Type */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Treningi według typu
              </h2>

              {Object.keys(sessionsByType).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Brak treningów do wyświetlenia
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(sessionsByType).map(([type, typeSessions]) => {
                    const completed = typeSessions.filter(s => s.status === 'completed').length;
                    return (
                      <Card key={type}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{type}</CardTitle>
                            <Badge variant="secondary">{typeSessions.length} sesji</Badge>
                          </div>
                          <CardDescription>
                            Ukończono {completed} z {typeSessions.length}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Progress 
                            value={typeSessions.length > 0 ? (completed / typeSessions.length) * 100 : 0} 
                            className="h-2"
                          />
                          <div className="mt-4 space-y-2">
                            {typeSessions.slice(0, 3).map(session => (
                              <div key={session.id} className="flex items-center justify-between text-sm">
                                <span className="truncate flex-1">{session.title}</span>
                                <span className="text-muted-foreground ml-2">
                                  {format(new Date(session.scheduled_at), "d MMM", { locale: pl })}
                                </span>
                              </div>
                            ))}
                            {typeSessions.length > 3 && (
                              <p className="text-sm text-muted-foreground">
                                +{typeSessions.length - 3} więcej
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Workouts */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Ostatnie treningi
              </h2>

              <div className="space-y-3">
                {sessions.slice(0, 5).map(session => (
                  <Card key={session.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.scheduled_at), "EEEE, d MMMM", { locale: pl })} • {session.duration_minutes} min
                            </p>
                          </div>
                        </div>
                        <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                          {session.status === 'completed' ? 'Ukończony' : 'Zaplanowany'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
