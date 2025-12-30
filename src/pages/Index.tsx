import DashboardLayout from "@/components/Coach_Layout";
import { StatCard } from "@/components/StatCard";
import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Activity,
} from "lucide-react";

const Index = () => {
  const stats = [
    {
      title: "Aktywni klienci",
      value: "24",
      icon: Users,
      change: { value: "12%", positive: true },
    },
    {
      title: "Sesje w tym tygodniu",
      value: "18",
      icon: Calendar,
      change: { value: "5%", positive: true },
    },
    {
      title: "Miesięczny przychód",
      value: "12,450 zł",
      icon: DollarSign,
      change: { value: "8%", positive: true },
    },
    {
      title: "Średni postęp",
      value: "87%",
      icon: TrendingUp,
      change: { value: "3%", positive: true },
    },
  ];

  const recentClients = [
    {
      name: "Anna Kowalska",
      email: "anna.kowalska@email.com",
      status: "active" as const,
      nextSession: "Dzisiaj, 15:00",
      progress: 85,
    },
    {
      name: "Marcin Nowak",
      email: "marcin.nowak@email.com",
      status: "new" as const,
      nextSession: "Jutro, 10:00",
      progress: 45,
    },
    {
      name: "Katarzyna Wiśniewska",
      email: "katarzyna.w@email.com",
      status: "active" as const,
      nextSession: "Piątek, 16:30",
      progress: 92,
    },
  ];

  const todaySchedule = [
    { time: "09:00", client: "Jan Kowalski", type: "Trening siłowy" },
    { time: "11:00", client: "Maria Nowak", type: "Cardio + stretching" },
    { time: "15:00", client: "Anna Kowalska", type: "Trening funkcjonalny" },
    { time: "17:00", client: "Piotr Zieliński", type: "Konsultacja" },
    { time: "19:00", client: "Ewa Kowalczyk", type: "Trening personalny" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-hero border border-border rounded-lg p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Dzień dobry! 👋
          </h1>
          <p className="text-muted-foreground">
            Masz dziś zaplanowanych 5vsesji treningowych. Pora osiągnąć nowe cele!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">
                Najnowsi klienci
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj klienta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentClients.map((client, index) => (
                <ClientCard key={index} {...client} />
              ))}
            </CardContent>
          </Card>

          {/* Today Schedule */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Plan na dziś
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaySchedule.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {session.client}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.type}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {session.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
