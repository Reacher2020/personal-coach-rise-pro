import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Target, Award, Calendar, Dumbbell, Clock } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { pl } from "date-fns/locale";

interface ClientData {
  progress: number;
  status: string;
  created_at: string;
}

interface Session {
  id: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
}

export default function ClientProgress() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
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

      // Fetch client data
      const { data: clients } = await supabase
        .from('clients')
        .select('progress, status, created_at')
        .eq('coach_id', profile.invited_by)
        .limit(1);

      if (clients && clients.length > 0) {
        setClientData(clients[0]);
      }

      // Fetch sessions
      const { data: sessionsData } = await supabase
        .from('training_sessions')
        .select('id, status, scheduled_at, duration_minutes')
        .eq('coach_id', profile.invited_by)
        .order('scheduled_at', { ascending: false });

      if (sessionsData) {
        setSessions(sessionsData);
      }

      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  // Calculate stats
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalSessions = sessions.length;
  
  const last30Days = subDays(new Date(), 30);
  const sessionsLast30Days = sessions.filter(s => isAfter(new Date(s.scheduled_at), last30Days)).length;
  const completedLast30Days = sessions.filter(
    s => s.status === 'completed' && isAfter(new Date(s.scheduled_at), last30Days)
  ).length;

  const totalMinutes = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  const streak = calculateStreak(sessions);

  function calculateStreak(sessions: Session[]): number {
    const completedDates = sessions
      .filter(s => s.status === 'completed')
      .map(s => format(new Date(s.scheduled_at), 'yyyy-MM-dd'))
      .sort()
      .reverse();

    if (completedDates.length === 0) return 0;

    let streak = 1;
    for (let i = 0; i < completedDates.length - 1; i++) {
      const current = new Date(completedDates[i]);
      const prev = new Date(completedDates[i + 1]);
      const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const progressValue = clientData?.progress || 0;
  const memberSince = clientData?.created_at 
    ? format(new Date(clientData.created_at), "d MMMM yyyy", { locale: pl })
    : '-';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mój postęp</h1>
          <p className="text-muted-foreground mt-1">Śledź swoje osiągnięcia i rozwój</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <>
            {/* Main Progress */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ogólny postęp
                </CardTitle>
                <CardDescription>Twój postęp według oceny trenera</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-primary">{progressValue}%</div>
                  <div className="flex-1">
                    <Progress value={progressValue} className="h-4" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {progressValue < 30 && "Początek drogi - każdy krok się liczy!"}
                      {progressValue >= 30 && progressValue < 60 && "Świetna robota! Jesteś na dobrej drodze."}
                      {progressValue >= 60 && progressValue < 80 && "Imponujący postęp! Tak trzymaj!"}
                      {progressValue >= 80 && "Niesamowite osiągnięcie! Jesteś mistrzem!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Ukończone sesje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedSessions}</div>
                  <p className="text-sm text-muted-foreground">z {totalSessions} łącznie</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Seria treningowa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{streak}</div>
                  <p className="text-sm text-muted-foreground">tygodniowa seria</p>
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
                  <p className="text-sm text-muted-foreground">{totalMinutes} minut</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ostatnie 30 dni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedLast30Days}</div>
                  <p className="text-sm text-muted-foreground">z {sessionsLast30Days} sesji</p>
                </CardContent>
              </Card>
            </div>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Osiągnięcia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className={`p-4 rounded-lg border ${completedSessions >= 1 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">🎯</div>
                    <p className="font-medium">Pierwszy trening</p>
                    <p className="text-sm text-muted-foreground">
                      {completedSessions >= 1 ? 'Odblokowano!' : 'Ukończ pierwszy trening'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${completedSessions >= 10 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">💪</div>
                    <p className="font-medium">10 treningów</p>
                    <p className="text-sm text-muted-foreground">
                      {completedSessions >= 10 ? 'Odblokowano!' : `${10 - completedSessions} do odblokowania`}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${completedSessions >= 50 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="font-medium">50 treningów</p>
                    <p className="text-sm text-muted-foreground">
                      {completedSessions >= 50 ? 'Odblokowano!' : `${50 - completedSessions} do odblokowania`}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${totalMinutes >= 600 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">⏱️</div>
                    <p className="font-medium">10 godzin</p>
                    <p className="text-sm text-muted-foreground">
                      {totalMinutes >= 600 ? 'Odblokowano!' : `${Math.max(0, 600 - totalMinutes)} min do odblokowania`}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${streak >= 4 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">🔥</div>
                    <p className="font-medium">4-tygodniowa seria</p>
                    <p className="text-sm text-muted-foreground">
                      {streak >= 4 ? 'Odblokowano!' : `Seria: ${streak}/4 tygodnie`}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${progressValue >= 100 ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-muted'}`}>
                    <div className="text-2xl mb-1">⭐</div>
                    <p className="font-medium">100% postępu</p>
                    <p className="text-sm text-muted-foreground">
                      {progressValue >= 100 ? 'Odblokowano!' : `Postęp: ${progressValue}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Info */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Członek od:</span>
                  <span className="font-medium">{memberSince}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
