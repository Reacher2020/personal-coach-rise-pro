import { useState } from "react";
import DashboardLayout from "@/components/Coach_Layout";
import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Users } from "lucide-react";

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const clients = [
    { name: "Anna Kowalska", email: "anna.kowalska@email.com", status: "active" as const, nextSession: "Dzisiaj, 15:00", progress: 85 },
    { name: "Marcin Nowak", email: "marcin.nowak@email.com", status: "new" as const, nextSession: "Jutro, 10:00", progress: 45 },
    { name: "Katarzyna Wiśniewska", email: "katarzyna.w@email.com", status: "active" as const, nextSession: "Piątek, 16:30", progress: 92 },
    { name: "Jan Kowalski", email: "jan.kowalski@email.com", status: "active" as const, nextSession: "Środa, 09:00", progress: 78 },
    { name: "Maria Nowak", email: "maria.nowak@email.com", status: "active" as const, nextSession: "Czwartek, 11:00", progress: 65 },
    { name: "Piotr Zieliński", email: "piotr.z@email.com", status: "inactive" as const, progress: 30 },
    { name: "Ewa Kowalczyk", email: "ewa.k@email.com", status: "active" as const, nextSession: "Poniedziałek, 19:00", progress: 88 },
    { name: "Tomasz Wiśniewski", email: "tomasz.w@email.com", status: "new" as const, nextSession: "Wtorek, 14:00", progress: 20 }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = clients.filter(c => c.status === "active").length;
  const newCount = clients.filter(c => c.status === "new").length;
  const inactiveCount = clients.filter(c => c.status === "inactive").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Klienci
            </h1>
            <p className="text-muted-foreground">
              Zarządzaj swoimi klientami i śledź ich postępy
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj klienta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Aktywnych</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{newCount}</p>
                <p className="text-sm text-muted-foreground">Nowych</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inactiveCount}</p>
                <p className="text-sm text-muted-foreground">Nieaktywnych</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj klienta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button variant="outline" className="border-border">
            <Filter className="h-4 w-4 mr-2" />
            Filtry
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => (
            <ClientCard key={index} {...client} />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nie znaleziono klientów
              </h3>
              <p className="text-muted-foreground">
                Spróbuj zmienić kryteria wyszukiwania
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
