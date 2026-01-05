import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import { format, isPast, isToday, isFuture } from "date-fns";
import { pl } from "date-fns/locale";

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  notes: string | null;
  coach_id: string;
}

interface CoachProfile {
  full_name: string | null;
}

export default function ClientSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<(Session & { coach?: CoachProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      // First get client record to find coach
      const { data: profile } = await supabase
        .from('profiles')
        .select('invited_by')
        .eq('user_id', user.id)
        .single();

      if (!profile?.invited_by) {
        setLoading(false);
        return;
      }

      // Fetch sessions for this client from the coach
      const { data: sessionsData } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('coach_id', profile.invited_by)
        .order('scheduled_at', { ascending: true });

      if (sessionsData) {
        // Get coach profile
        const { data: coachProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', profile.invited_by)
          .single();

        const sessionsWithCoach = sessionsData.map(session => ({
          ...session,
          coach: coachProfile || undefined
        }));

        setSessions(sessionsWithCoach);
      }

      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const date = new Date(scheduledAt);
    
    if (status === 'completed') {
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Zakończona</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge variant="destructive">Anulowana</Badge>;
    }
    if (isPast(date) && status === 'scheduled') {
      return <Badge variant="secondary">Przeszła</Badge>;
    }
    if (isToday(date)) {
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Dzisiaj</Badge>;
    }
    return <Badge variant="outline">Zaplanowana</Badge>;
  };

  const upcomingSessions = sessions.filter(s => isFuture(new Date(s.scheduled_at)) || isToday(new Date(s.scheduled_at)));
  const pastSessions = sessions.filter(s => isPast(new Date(s.scheduled_at)) && !isToday(new Date(s.scheduled_at)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moje sesje treningowe</h1>
          <p className="text-muted-foreground mt-1">Przeglądaj nadchodzące i zakończone sesje</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Nadchodzące sesje ({upcomingSessions.length})
              </h2>
              
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Brak zaplanowanych sesji
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingSessions.map(session => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <CardDescription>{session.type}</CardDescription>
                          </div>
                          {getStatusBadge(session.status, session.scheduled_at)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(session.scheduled_at), "EEEE, d MMMM yyyy", { locale: pl })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(session.scheduled_at), "HH:mm")} ({session.duration_minutes} min)
                          </div>
                          {session.coach?.full_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Trener: {session.coach.full_name}
                            </div>
                          )}
                        </div>
                        {session.notes && (
                          <p className="mt-3 text-sm bg-muted/50 p-3 rounded-lg">{session.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Historia sesji ({pastSessions.length})
              </h2>
              
              {pastSessions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Brak historii sesji
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {pastSessions.slice(0, 10).map(session => (
                    <Card key={session.id} className="bg-muted/30">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.scheduled_at), "d MMMM yyyy, HH:mm", { locale: pl })}
                            </p>
                          </div>
                          {getStatusBadge(session.status, session.scheduled_at)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
