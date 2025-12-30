import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Plus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";

interface Session {
  id: number;
  time: string;
  client: string;
  type: string;
  duration: string;
  date: Date;
}

const CalendarPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sessions: Session[] = [
    { id: 1, time: "09:00", client: "Jan Kowalski", type: "Trening siłowy", duration: "60 min", date: new Date() },
    { id: 2, time: "11:00", client: "Maria Nowak", type: "Cardio + stretching", duration: "45 min", date: new Date() },
    { id: 3, time: "15:00", client: "Anna Kowalska", type: "Trening funkcjonalny", duration: "60 min", date: new Date() },
    { id: 4, time: "17:00", client: "Piotr Zieliński", type: "Konsultacja", duration: "30 min", date: new Date() },
    { id: 5, time: "19:00", client: "Ewa Kowalczyk", type: "Trening personalny", duration: "60 min", date: new Date() },
    { id: 6, time: "10:00", client: "Marcin Nowak", type: "Trening siłowy", duration: "60 min", date: addDays(new Date(), 1) },
    { id: 7, time: "14:00", client: "Katarzyna Wiśniewska", type: "Cardio", duration: "45 min", date: addDays(new Date(), 1) },
    { id: 8, time: "09:30", client: "Tomasz Wiśniewski", type: "Wprowadzenie", duration: "90 min", date: addDays(new Date(), 2) },
  ];

  const filteredSessions = sessions.filter(session => 
    isSameDay(session.date, selectedDate)
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Trening siłowy":
        return "bg-primary text-primary-foreground";
      case "Cardio":
      case "Cardio + stretching":
        return "bg-secondary text-secondary-foreground";
      case "Konsultacja":
      case "Wprowadzenie":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
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
                Kalendarz
              </h1>
              <p className="text-muted-foreground">
                Zarządzaj sesjami treningowymi
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nowa sesja
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-foreground">Wybierz datę</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={pl}
                  className="rounded-md border-0 pointer-events-auto"
                />
              </CardContent>
            </Card>

            {/* Day Schedule */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    {format(selectedDate, "EEEE, d MMMM yyyy", { locale: pl })}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredSessions.length} {filteredSessions.length === 1 ? "sesja" : filteredSessions.length < 5 ? "sesje" : "sesji"} zaplanowanych
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-lg font-bold text-primary">{session.time}</span>
                        <span className="text-xs text-muted-foreground">{session.duration}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{session.client}</span>
                        </div>
                        <Badge className={getTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Szczegóły
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Brak zaplanowanych sesji
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Nie masz żadnych sesji na ten dzień
                    </p>
                    <Button className="bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj sesję
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Week Overview */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Przegląd tygodnia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const daySessions = getSessionsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : isToday 
                            ? "bg-primary/20 border border-primary" 
                            : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <p className={`text-xs font-medium mb-1 ${
                        isSelected ? "text-primary-foreground" : "text-muted-foreground"
                      }`}>
                        {format(day, "EEE", { locale: pl })}
                      </p>
                      <p className={`text-lg font-bold ${
                        isSelected ? "text-primary-foreground" : "text-foreground"
                      }`}>
                        {format(day, "d")}
                      </p>
                      {daySessions.length > 0 && (
                        <div className={`mt-2 text-xs ${
                          isSelected ? "text-primary-foreground/80" : "text-primary"
                        }`}>
                          {daySessions.length} {daySessions.length === 1 ? "sesja" : "sesje"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage;
