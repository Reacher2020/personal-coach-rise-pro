import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/Coach_Layout';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import { Users, UserPlus, Shield, Mail, Clock, CheckCircle2, XCircle, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInvitations, InvitationRole } from '@/hooks/useInvitations';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const AdminDashboard = () => {
  const { toast } = useToast();
  const {
    invitations,
    fetchInvitations,
    createInvitation,
    deleteInvitation,
    loading
  } = useInvitations();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitationRole>('coach');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const sendInvite = async () => {
    await createInvitation(email, role);
    setEmail('');
    setOpen(false);
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/auth?invite=${token}`
    );
    toast({ title: 'Link skopiowany' });
  };

  const statusBadge = (s: string) => {
    if (s === 'pending') return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Oczekuje</Badge>;
    if (s === 'accepted') return <Badge className="bg-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Zaakceptowane</Badge>;
    return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />Wygasło</Badge>;
  };

  const renderTable = (data: typeof invitations) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Wysłano</TableHead>
          <TableHead>Wygasa</TableHead>
          <TableHead className="text-right">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(inv => (
          <TableRow key={inv.id}>
            <TableCell>{inv.email}</TableCell>
            <TableCell>{statusBadge(inv.status)}</TableCell>
            <TableCell>{format(new Date(inv.created_at), 'dd MMM yyyy', { locale: pl })}</TableCell>
            <TableCell>{format(new Date(inv.expires_at), 'dd MMM yyyy', { locale: pl })}</TableCell>
            <TableCell className="text-right">
              {inv.status === 'pending' && (
                <Button size="icon" variant="ghost" onClick={() => copyLink(inv.token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => deleteInvitation(inv.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Panel Administratora</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Zaproś użytkownika</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowe zaproszenie</DialogTitle>
            </DialogHeader>

            <Label>Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />

            <div className="flex gap-2">
              <Button variant={role === 'coach' ? 'default' : 'outline'} onClick={() => setRole('coach')}>
                Trener
              </Button>
              <Button variant={role === 'admin' ? 'default' : 'outline'} onClick={() => setRole('admin')}>
                Admin
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={sendInvite} disabled={loading}>Wyślij</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="coach">
          <TabsList>
            <TabsTrigger value="coach"><Users className="h-4 w-4 mr-1" /> Trenerzy</TabsTrigger>
            <TabsTrigger value="admin"><Shield className="h-4 w-4 mr-1" /> Admini</TabsTrigger>
          </TabsList>

          <TabsContent value="coach">
            <Card>
              <CardHeader>
                <CardTitle>Zaproszenia trenerów</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(invitations.filter(i => i.role === 'coach'))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Zaproszenia administratorów</CardTitle>
              </CardHeader>
              <CardContent>
                {renderTable(invitations.filter(i => i.role === 'admin'))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
