import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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

const Stat = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 bg-muted rounded">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const Payments = () => {
  const { toast } = useToast();
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

  const totalPaid = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const totalOverdue = filteredPayments
    .filter((p) => p.status === "overdue")
    .reduce((s, p) => s + p.amount, 0);

  const updatePaymentStatus = (id: string, newStatus: Payment["status"]) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        if (p.status === "cancelled" && newStatus === "paid") {
          toast({
            title: "Zmiana zablokowana",
            description: 'Nie można zmienić statusu z „Anulowane" na „Opłacone".',
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Płatności</h1>
            <p className="text-muted-foreground">Zarządzaj płatnościami klientów</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Nowa płatność
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat title="Opłacone" value={`${totalPaid} zł`} icon={<DollarSign className="h-5 w-5 text-primary" />} />
          <Stat title="Oczekujące" value={`${totalPending} zł`} icon={<Clock className="h-5 w-5 text-primary" />} />
          <Stat title="Zaległe" value={`${totalOverdue} zł`} icon={<AlertCircle className="h-5 w-5 text-destructive" />} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-card border-border"
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
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
                    <TableCell className="font-mono text-foreground">{p.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{p.clientName}</p>
                        <p className="text-sm text-muted-foreground">{p.clientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{p.description}</TableCell>
                    <TableCell className="text-foreground">{p.amount} zł</TableCell>
                    <TableCell>
                      <StatusSelect payment={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
