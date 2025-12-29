import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const progressData = [
    { name: "Tydz 1", waga: 85, silaPlecy: 60, silaKlatka: 55 },
    { name: "Tydz 2", waga: 84.5, silaPlecy: 65, silaKlatka: 58 },
    { name: "Tydz 3", waga: 84, silaPlecy: 68, silaKlatka: 60 },
    { name: "Tydz 4", waga: 83.2, silaPlecy: 72, silaKlatka: 65 },
    { name: "Tydz 5", waga: 82.8, silaPlecy: 75, silaKlatka: 68 },
    { name: "Tydz 6", waga: 82.3, silaPlecy: 78, silaKlatka: 72 },
    { name: "Tydz 7", waga: 81.9, silaPlecy: 82, silaKlatka: 75 },
    { name: "Tydz 8", waga: 81.5, silaPlecy: 85, silaKlatka: 78 },
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
    { title: "Mistrz regularności", description: "Anna Kowalska - 30 dni bez przerwy", icon: Flame },
    { title: "Rekord siły", description: "Jan Kowalski - nowy PR w martwym ciągu", icon: Award },
    { title: "Cel osiągnięty", description: "Ewa Kowalczyk - cel wagowy zrealizowany", icon: Target },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="p-4 lg:p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Postępy
              </h1>
              <p className="text-muted-foreground">
                Śledź postępy swoich klientów
              </p>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Wybierz okres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Ostatni tydzień</SelectItem>
                <SelectItem value="month">Ostatni miesiąc</SelectItem>
                <SelectItem value="quarter">Ostatni kwartał</SelectItem>
                <SelectItem value="year">Ostatni rok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Średni postęp</p>
                    <p className="text-2xl font-bold text-foreground">87%</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5% vs poprzedni okres</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cele osiągnięte</p>
                    <p className="text-2xl font-bold text-foreground">12</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-secondary-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3 w tym miesiącu</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sesji wykonanych</p>
                    <p className="text-2xl font-bold text-foreground">156</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/50 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% vs poprzedni okres</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Osiągnięcia</p>
                    <p className="text-2xl font-bold text-foreground">8</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span>W tym miesiącu</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight & Strength Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Postęp - średnia klientów</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="silaPlecy" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      name="Siła pleców"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="silaKlatka" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                      name="Siła klatki"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sessions per Day */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sesje w tygodniu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar 
                      dataKey="sesje" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Sesje"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clients */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Najlepsze postępy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-primary text-hero-foreground font-semibold text-sm">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.goal}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{client.progress}%</p>
                      <div className={`flex items-center gap-1 text-xs ${client.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {client.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{client.change >= 0 ? '+' : ''}{client.change}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ostatnie osiągnięcia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full">
                  Zobacz wszystkie osiągnięcia
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Progress;
