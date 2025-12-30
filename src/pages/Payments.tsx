import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  Search, 
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Payment {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  date: string;
  dueDate: string;
  description: string;
  method: string;
}

const payments: Payment[] = [
  {
    id: "PAY-001",
    clientName: "Anna Kowalska",
    clientEmail: "anna@example.com",
    amount: 400,
    status: "paid",
    date: "2024-01-15",
    dueDate: "2024-01-15",
    description: "Pakiet treningów - Styczeń",
    method: "Przelew"
  },
  {
    id: "PAY-002",
    clientName: "Jan Nowak",
    clientEmail: "jan@example.com",
    amount: 600,
    status: "paid",
    date: "2024-01-12",
    dueDate: "2024-01-15",
    description: "Pakiet Premium - Styczeń",
    method: "Karta"
  },
  {
    id: "PAY-003",
    clientName: "Maria Wiśniewska",
    clientEmail: "maria@example.com",
    amount: 400,
    status: "pending",
    date: "",
    dueDate: "2024-01-20",
    description: "Pakiet treningów - Styczeń",
    method: "-"
  },
  {
    id: "PAY-004",
    clientName: "Piotr Zieliński",
    clientEmail: "piotr@example.com",
    amount: 800,
    status: "overdue",
    date: "",
    dueDate: "2024-01-10",
    description: "Pakiet VIP - Styczeń",
    method: "-"
  },
  {
    id: "PAY-005",
    clientName: "Katarzyna Lewandowska",
    clientEmail: "kasia@example.com",
    amount: 400,
    status: "paid",
    date: "2024-01-08",
    dueDate: "2024-01-10",
    description: "Pakiet treningów - Styczeń",
    method: "BLIK"
  },
  {
    id: "PAY-006",
    clientName: "Tomasz Wójcik",
    clientEmail: "tomasz@example.com",
    amount: 600,
    status: "cancelled",
    date: "",
    dueDate: "2024-01-05",
    description: "Pakiet Premium - Styczeń",
    method: "-"
  },
  {
    id: "PAY-007",
    clientName: "Magdalena Kamińska",
    clientEmail: "magda@example.com",
    amount: 400,
    status: "pending",
    date: "",
    dueDate: "2024-01-25",
    description: "Pakiet treningów - Styczeń",
    method: "-"
  }
];

const Payments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Opłacone
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Oczekujące
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Zaległe
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-muted text-muted-foreground hover:bg-muted/80 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Anulowane
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Płatności</h1>
              <p className="text-muted-foreground mt-1">Zarządzaj płatnościami i fakturami klientów</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nowa płatność
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Opłacone</p>
                    <p className="text-xl font-bold text-foreground">{totalPaid} zł</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Oczekujące</p>
                    <p className="text-xl font-bold text-foreground">{totalPending} zł</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Zaległe</p>
                    <p className="text-xl font-bold text-foreground">{totalOverdue} zł</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj płatności..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="paid">Opłacone</SelectItem>
                <SelectItem value="pending">Oczekujące</SelectItem>
                <SelectItem value="overdue">Zaległe</SelectItem>
                <SelectItem value="cancelled">Anulowane</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Historia płatności
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">Klient</TableHead>
                    <TableHead className="text-muted-foreground">Opis</TableHead>
                    <TableHead className="text-muted-foreground">Kwota</TableHead>
                    <TableHead className="text-muted-foreground">Termin</TableHead>
                    <TableHead className="text-muted-foreground">Metoda</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {payment.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{payment.clientName}</p>
                            <p className="text-sm text-muted-foreground">{payment.clientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{payment.description}</TableCell>
                        <TableCell className="font-semibold text-foreground">{payment.amount} zł</TableCell>
                        <TableCell className="text-muted-foreground">{payment.dueDate}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nie znaleziono płatności
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Payments;
