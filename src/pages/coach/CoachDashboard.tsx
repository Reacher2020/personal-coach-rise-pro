import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Activity,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { pl } from "date-fns/locale";

interface Client {
  id: string;
  name: string;
  email: string | null;
  status: string;
  progress: number | null;
}

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
  status: string;
  client_id: string | null;
  clients?: { name: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
  client_id: string | null;
  clients?: { name: string } | null;
}

interface Profile {
  full_name: string | null;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [weekSessions, setWeekSessions] = useState<Session[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, email, status, progress')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      setClients(clientsData || []);

      // Fetch today's sessions
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: todaySessionsData } = await supabase
        .from('training_sessions')
        .select('id, title, scheduled_at, duration_minutes, type, status, client_id, clients(name)')
        .eq('coach_id', user.id)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay)
        .order('scheduled_at', { ascending: true });

      setTodaySessions(todaySessionsData || []);

      // Fetch this week's sessions
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

      const { data: weekSessionsData } = await supabase
        .from('training_sessions')
        .select('id, title, scheduled_at, duration_minutes, type, status, client_id')
        .eq('coach_id', user.id)
        .gte('scheduled_at', weekStart)
        .lte('scheduled_at', weekEnd);

      setWeekSessions(weekSessionsData || []);

      // Fetch recent payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('id, amount, status, description, created_at, due_date, paid_at, client_id, clients(name)')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPayments(paymentsData || []);

      // Calculate monthly revenue
      const monthStart = startOfMonth(new Date()).toISOString();
      const monthEnd = endOfMonth(new Date()).toISOString();

      const { data: monthPaymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('coach_id', user.id)
        .eq('status', 'paid')
        .gte('paid_at', monthStart)
        .lte('paid_at', monthEnd);

      const revenue = (monthPaymentsData || []).reduce((sum, p) => sum + Number(p.amount), 0);
      setMonthlyRevenue(revenue);

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const activeClients = clients.filter(c => c.status === 'active').length;
  const avgProgress = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + (c.progress || 0), 0) / clients.length)
    : 0;

  const stats = [
    {
      title: "Aktywni klienci",
      value: activeClients.toString(),
      icon: Users,
      change: { value: `${clients.length} łącznie`, positive: true },
    },
    {
      title: "Sesje w tym tygodniu",
      value: weekSessions.length.toString(),
      icon: Calendar,
      change: { value: `${todaySessions.length} dziś`, positive: true },
    },
    {
      title: "Przychód miesięczny",
      value: `${monthlyRevenue.toLocaleString('pl-PL')} zł`,
      icon: DollarSign,
      change: { value: "opłacone", positive: true },
    },
    {
      title: "Średni postęp",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      change: { value: "klientów", positive: avgProgress > 50 },
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Dzień dobry";
    if (hour < 18) return "Cześć";
    return "Dobry wieczór";
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Opłacone</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Oczekuje</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />Zaległe</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const recentClientsData = clients.slice(0, 3).map(client => ({
    id: client.id,
    name: client.name,
    email: client.email || '',
    status: client.status as 'active' | 'new' | 'inactive',
    nextSession: '-',
    progress: client.progress || 0,
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-hero border border-border rounded-lg p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Trenerze'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {todaySessions.length > 0 
              ? `Masz dziś zaplanowanych ${todaySessions.length} ${todaySessions.length === 1 ? 'sesję' : todaySessions.length < 5 ? 'sesje' : 'sesji'} treningowych.`
              : 'Nie masz dziś żadnych zaplanowanych sesji.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Plan na dziś
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Brak sesji na dziś</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/coach/calendar')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Zaplanuj sesję
                  </Button>
                </div>
              ) : (
                todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {session.clients?.name || 'Bez klienta'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.title} • {session.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        {format(new Date(session.scheduled_at), 'HH:mm')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.duration_minutes} min
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Clients */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">
                Najnowsi klienci
              </CardTitle>
              <Button size="sm" onClick={() => navigate('/coach/clients')}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentClientsData.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Brak klientów</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/coach/clients')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj pierwszego klienta
                  </Button>
                </div>
              ) : (
                recentClientsData.map((client) => (
                  <ClientCard key={client.id} {...client} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className="bg-card border-border shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
              Ostatnie płatności
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => navigate('/coach/payments')}>
              Zobacz wszystkie
            </Button>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak płatności</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.clients?.name || 'Nieprzypisane'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.description || 'Płatność'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      {getPaymentStatusBadge(payment.status)}
                      <div>
                        <p className="font-bold text-foreground">
                          {Number(payment.amount).toLocaleString('pl-PL')} zł
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), 'dd MMM yyyy', { locale: pl })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
