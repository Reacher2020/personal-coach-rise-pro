import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Users, Mail, Copy, Trash2, Loader2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useInvitations } from "@/hooks/useInvitations";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  const { clients, loading, addClient, updateClient, deleteClient, getClientStats } = useClients();
  const { createInvitation, getMyInvitations, deleteInvitation, loading: inviteLoading } = useInvitations();
  const { toast } = useToast();

  const stats = getClientStats();

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleUpdateClient = useCallback(async (id: string, data: { name: string; email: string | null; phone: string | null; status: string; progress: number }) => {
    await updateClient(id, data);
  }, [updateClient]);

  const handleDeleteClient = useCallback(async (id: string) => {
    await deleteClient(id);
  }, [deleteClient]);

  const loadInvitations = async () => {
    setInvitationsLoading(true);
    const { data } = await getMyInvitations();
    if (data) {
      setInvitations(data.filter((inv) => inv.role === "client"));
    }
    setInvitationsLoading(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    const { error } = await addClient({
      name: newClientName,
      email: newClientEmail || null,
      phone: newClientPhone || null,
      status: "new",
    });

    if (!error) {
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setIsAddDialogOpen(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) return;

    const { error } = await createInvitation(inviteEmail, "client");

    if (!error) {
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      loadInvitations();
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/auth?invite=${token}`;
    await navigator.clipboard.writeText(link);
    toast({
      title: "Link skopiowany",
      description: "Link do zaproszenia został skopiowany do schowka",
    });
  };

  const handleDeleteInvitation = async (id: string) => {
    await deleteInvitation(id);
    loadInvitations();
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");
  const acceptedInvitations = invitations.filter((inv) => inv.status === "accepted");

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
          <div className="flex gap-2">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border">
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij zaproszenie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Zaproś klienta</DialogTitle>
                  <DialogDescription>
                    Wyślij zaproszenie email do nowego klienta. Po rejestracji
                    zostanie automatycznie przypisany do Ciebie.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email klienta</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="klient@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleSendInvitation}
                    disabled={inviteLoading || !inviteEmail.trim()}
                  >
                    {inviteLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Wyślij zaproszenie
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground shadow-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj klienta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dodaj klienta ręcznie</DialogTitle>
                  <DialogDescription>
                    Dodaj nowego klienta bez wysyłania zaproszenia email.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Imię i nazwisko *</Label>
                    <Input
                      id="name"
                      placeholder="Jan Kowalski"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jan@email.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleAddClient}
                    disabled={loading || !newClientName.trim()}
                  >
                    {loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Dodaj klienta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeCount}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.newCount}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.inactiveCount}
                </p>
                <p className="text-sm text-muted-foreground">Nieaktywnych</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">
              Klienci ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Zaproszenia ({pendingInvitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    id={client.id}
                    name={client.name}
                    email={client.email || ""}
                    phone={client.phone || ""}
                    userId={client.user_id}
                    status={client.status as "active" | "inactive" | "new"}
                    progress={client.progress || 0}
                    onUpdate={handleUpdateClient}
                    onDelete={handleDeleteClient}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchQuery
                      ? "Nie znaleziono klientów"
                      : "Brak klientów"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Spróbuj zmienić kryteria wyszukiwania"
                      : "Dodaj pierwszego klienta lub wyślij zaproszenie"}
                  </p>
                  {!searchQuery && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(true)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Wyślij zaproszenie
                      </Button>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj klienta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length > 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data wysłania</TableHead>
                        <TableHead>Wygasa</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">
                            {invitation.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invitation.status === "accepted"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {invitation.status === "accepted"
                                ? "Zaakceptowane"
                                : "Oczekujące"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(invitation.created_at),
                              "d MMM yyyy",
                              { locale: pl }
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(invitation.expires_at),
                              "d MMM yyyy",
                              { locale: pl }
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {invitation.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleCopyInviteLink(invitation.token)
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteInvitation(invitation.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Brak zaproszeń
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Wyślij zaproszenie email do nowego klienta
                  </p>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Wyślij zaproszenie
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;
