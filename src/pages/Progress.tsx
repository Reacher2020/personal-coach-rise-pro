import { useState } from "react";
import DashboardLayout from "@/components/Coach_Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Flame,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const progressData = [
    { name: "Tydz 1", silaPlecy: 60, silaKlatka: 55 },
    { name: "Tydz 2", silaPlecy: 65, silaKlatka: 58 },
    { name: "Tydz 3", silaPlecy: 68, silaKlatka: 60 },
    { name: "Tydz 4", silaPlecy: 72, silaKlatka: 65 },
    { name: "Tydz 5", silaPlecy: 75, silaKlatka: 68 },
    { name: "Tydz 6", silaPlecy: 78, silaKlatka: 72 },
    { name: "Tydz 7", silaPlecy: 82, silaKlatka: 75 },
    { name: "Tydz 8", silaPlecy: 85, silaKlatka: 78 },
  ];

  const sessionsData = [
    { name: "Pon", sesje: 8 },
    { name: "Wt", sesje: 6 },
    { name: "Śr", sesje: 9 },
    { name: "Czw", sesje: 7 },
    { name: "Pt", sesje: 10 },
    { name: "Sob", sesje: 4 },
    { name: "Nd", sesje: 2 },
  ];

  const topClients = [
    { name: "Anna Kowalska", progress: 92, change: 8, goal: "Redukcja wagi" },
    { name: "Katarzyna Wiśniewska", progress: 88, change: 12, goal: "Budowa mięśni" },
    { name: "Ewa Kowalczyk", progress: 85, change: 5, goal: "Poprawa kondycji" },
    { name: "Jan Kowalski", progress: 78, change: 15, goal: "Siła" },
    { name: "Maria Nowak", progress: 72, change: -2, goal: "Redukcja wagi" },
  ];

  const achievements = [
    { title: "Mistrz regularności", desc: "Anna Kowalska – 30 dni bez przerwy", icon: Flame },
    { title: "Rekord siły", desc: "Jan Kowalski – nowy PR", icon: Award },
    { title: "Cel osiągnięty", desc: "Ewa Kowalczyk – cel wagowy", icon: Target },
  ];

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).join("");

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Postępy</h1>
          <p className="text-muted-foreground">
            Śledź postępy swoich klientów
          </p>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tydzień</SelectItem>
            <SelectItem value="month">Miesiąc</SelectItem>
            <SelectItem value="quarter">Kwartał</SelectItem>
            <SelectItem value="year">Rok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Średni postęp" value="87%" icon={<TrendingUp />} />
        <Stat title="Cele osiągnięte" value="12" icon={<Target />} />
        <Stat title="Sesji wykonanych" value="156" icon={<Flame />} />
        <Stat title="Osiągnięcia" value="8" icon={<Award />} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Postęp siłowy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line dataKey="silaPlecy" stroke="hsl(var(--primary))" />
                <Line dataKey="silaKlatka" stroke="hsl(var(--secondary))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesje w tygodniu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={300}>
              <BarChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sesje" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* LISTY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Najlepsze postępy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClients.map((c, i) => (
              <div key={i} className="flex items-center gap-4 bg-muted/30 p-3 rounded">
                <span className="font-bold">{i + 1}</span>
                <Avatar>
                  <AvatarFallback>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.goal}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{c.progress}%</p>
                  <div className={`flex items-center gap-1 text-xs ${c.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {c.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {c.change}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ostatnie osiągnięcia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex gap-4 bg-muted/30 p-4 rounded">
                  <Icon />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full">
              Zobacz wszystkie
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const Stat = ({ title, value, icon }: any) => (
  <Card>
    <CardContent className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-2 bg-muted rounded">{icon}</div>
    </CardContent>
  </Card>
);

export default Progress;
