<<<<<<< HEAD
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
import { useInvitations } from '@/hooks/useInvitations';
import { Invitation } from '@/types/invitation';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
=======
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Coach_Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useInvitations } from '@/hooks/useInvitations';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
>>>>>>> 37dcdd658cb9d2f0b503dd2225890032884da0a1

<<<<<<< HEAD
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
  const [role, setRole] = useState<'coach' | 'admin'>('coach');
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

  const renderTable = (data: Invitation[]) => (
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

=======
interface Coach {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { createInvitation, getAllInvitations, deleteInvitation, loading: invLoading } = useInvitations();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    setLoadingData(true);
    
    // Fetch coaches (profiles with coach role)
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'coach');

    if (rolesData && rolesData.length > 0) {
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      setCoaches(profilesData || []);
    } else {
      setCoaches([]);
    }

    // Fetch invitations
    const { data: invData } = await getAllInvitations();
    setInvitations(invData || []);
    
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendInvitation = async () => {
    if (!inviteEmail) return;
    
    const { error } = await createInvitation(inviteEmail, 'coach');
    if (!error) {
      setInviteEmail('');
      setInviteDialogOpen(false);
      fetchData();
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    await deleteInvitation(id);
    fetchData();
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/auth?invite=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link skopiowany',
      description: 'Link zaproszenia został skopiowany do schowka',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Oczekuje</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Zaakceptowane</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Wygasło</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'coach':
        return <Badge className="bg-primary/20 text-primary">Trener</Badge>;
      case 'client':
        return <Badge className="bg-secondary/50 text-secondary-foreground">Klient</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const initials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase();
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending' && i.role === 'coach');
  const acceptedInvitations = invitations.filter(i => i.status === 'accepted' && i.role === 'coach');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Panel Administratora
            </h1>
            <p className="text-muted-foreground">
              Zarządzaj trenerami i zaproszeniami
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-glow">
                <UserPlus className="h-4 w-4 mr-2" />
                Zaproś trenera
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zaproś nowego trenera</DialogTitle>
                <DialogDescription>
                  Wyślij zaproszenie email do nowego trenera
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adres email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="trener@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleSendInvitation} disabled={invLoading || !inviteEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Wyślij zaproszenie
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{coaches.length}</p>
                <p className="text-sm text-muted-foreground">Trenerów</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingInvitations.length}</p>
                <p className="text-sm text-muted-foreground">Oczekujących zaproszeń</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{acceptedInvitations.length}</p>
                <p className="text-sm text-muted-foreground">Zaakceptowanych</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="coaches" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="coaches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4 mr-2" />
              Trenerzy
            </TabsTrigger>
            <TabsTrigger value="invitations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Mail className="h-4 w-4 mr-2" />
              Zaproszenia
            </TabsTrigger>
          </TabsList>

          {/* Coaches Tab */}
          <TabsContent value="coaches">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Lista trenerów</CardTitle>
                <CardDescription>Wszyscy zarejestrowani trenerzy w systemie</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
                ) : coaches.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Brak zarejestrowanych trenerów</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Zaproś pierwszego trenera
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trener</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Specjalizacja</TableHead>
                        <TableHead>Data rejestracji</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {initials(coach.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{coach.full_name || 'Brak nazwy'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{coach.email || '-'}</TableCell>
                          <TableCell>{coach.phone || '-'}</TableCell>
                          <TableCell>{coach.specialization || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(coach.created_at), 'dd MMM yyyy', { locale: pl })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Zaproszenia dla trenerów</CardTitle>
                <CardDescription>Zarządzaj wysłanymi zaproszeniami</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
                ) : invitations.filter(i => i.role === 'coach').length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Brak zaproszeń</p>
                  </div>
                ) : (
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
                      {invitations.filter(i => i.role === 'coach').map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell>
                            {format(new Date(inv.created_at), 'dd MMM yyyy', { locale: pl })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(inv.expires_at), 'dd MMM yyyy', { locale: pl })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyInviteLink(inv.token)}
                                  title="Kopiuj link"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteInvitation(inv.id)}
                                className="text-destructive hover:text-destructive"
                                title="Usuń"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

>>>>>>> 37dcdd658cb9d2f0b503dd2225890032884da0a1