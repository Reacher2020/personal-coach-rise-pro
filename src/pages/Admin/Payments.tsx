import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
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
import { useToast } from "@/components/ui/use-toast";
import {
  CreditCard,
  Search,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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

const initialPayments: Payment[] = [
  {
    id: "PAY-001",
    clientName: "Anna Kowalska",
    clientEmail: "anna@example.com",
    amount: 400,
    status: "paid",
    date: "2024-01-15",
    dueDate: "2024-01-15",
    description: "Pakiet treningów - Styczeń",
    method: "Przelew",
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
    method: "Karta",
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
    method: "-",
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
    method: "-",
  },
  {
    id: "PAY-005",
    clientName: "Katarzyna Lewandowska",
    clientEmail: "kasia@example.com",
    amount: 400,
    status: "cancelled",
    date: "",
    dueDate: "2024-01-10",
    description: "Pakiet treningów - Styczeń",
    method: "-",
  },
];

const Payments = () => {
  const { toast } = useToast();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 🔢 SUMY Z FILTROWANYCH DANYCH
  const totalPaid = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const totalOverdue = filteredPayments
    .filter((p) => p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);

  // 🔁 ZMIANA STATUSU + WALIDACJA
  const updatePaymentStatus = (
    id: string,
    newStatus: Payment["status"]
  ) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        // ❌ BLOKADA cancelled → paid
        if (p.status === "cancelled" && newStatus === "paid") {
          toast({
            title: "Zmiana zablokowana",
            description:
              "Nie można zmienić statusu z „Anulowane” na „Opłacone”.",
            variant: "destructive",
          });
          return p;
        }

        toast({
          title: "Status zaktualizowany",
          description: `${p.clientName}: ${p.status} → ${newStatus}`,
        });

        return { ...p, status: newStatus };
      })
    );
  };

  const StatusSelect = ({ payment }: { payment: Payment }) => (
    <Select
      value={payment.status}
      onValueChange={(value) =>
        updatePaymentStatus(payment.id, value as Payment["status"])
      }
    >
      <SelectTrigger className="h-8 w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paid">Opłacone</SelectItem>
        <SelectItem value="pending">Oczekujące</SelectItem>
        <SelectItem value="overdue">Zaległe</SelectItem>
        <SelectItem value="cancelled">Anulowane</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 p-6 space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Płatności</h1>
              <p className="text-muted-foreground">
                Zarządzaj płatnościami klientów
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nowa płatność
            </Button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            <Stat title="Opłacone" value={`${totalPaid} zł`} icon={<DollarSign />} />
            <Stat title="Oczekujące" value={`${totalPending} zł`} icon={<Clock />} />
            <Stat title="Zaległe" value={`${totalOverdue} zł`} icon={<AlertCircle />} />
          </div>

          {/* FILTERS */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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

          {/* TABLE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historia płatności
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono">{p.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{p.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.clientEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{p.description}</TableCell>
                      <TableCell>{p.amount} zł</TableCell>
                      <TableCell>
                        <StatusSelect payment={p} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

const Stat = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 bg-muted rounded">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default Payments;
