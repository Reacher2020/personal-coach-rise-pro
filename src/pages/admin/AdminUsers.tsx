import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Coach_Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Trash2,
  Shield,
  UserCog,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'coach' | 'client';
  created_at: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setLoading(false);
      return;
    }

    if (!rolesData || rolesData.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(rolesData.map(r => r.user_id))];

    // Fetch profiles for these users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, avatar_url, created_at')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Combine data
    const usersWithRoles: UserWithRole[] = rolesData.map(role => {
      const profile = profilesData?.find(p => p.user_id === role.user_id);
      return {
        user_id: role.user_id,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
        avatar_url: profile?.avatar_url || null,
        role: role.role,
        created_at: profile?.created_at || role.created_at,
      };
    });

    // Sort: admins first, then coaches, then clients
    usersWithRoles.sort((a, b) => {
      const order = { admin: 0, coach: 1, client: 2 };
      return order[a.role] - order[b.role];
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (user: UserWithRole) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    try {
      // First delete from public tables
      await supabase.from('user_roles').delete().eq('user_id', userToDelete.user_id);
      await supabase.from('coach_settings').delete().eq('user_id', userToDelete.user_id);
      await supabase.from('profiles').delete().eq('user_id', userToDelete.user_id);

      // Then delete from auth.users via edge function
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userToDelete.user_id }
      });

      if (error) throw error;

      toast({
        title: 'Użytkownik usunięty',
        description: `Konto ${userToDelete.email || userToDelete.full_name} zostało usunięte`,
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się usunąć użytkownika',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setChangingRole(userId);
    
    try {
      // Delete old role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast({
        title: 'Rola zmieniona',
        description: `Rola użytkownika została zmieniona na ${newRole === 'admin' ? 'Admin' : newRole === 'coach' ? 'Trener' : 'Klient'}`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zmienić roli',
        variant: 'destructive',
      });
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case 'coach':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <UserCog className="h-3 w-3 mr-1" />
            Trener
          </Badge>
        );
      case 'client':
        return (
          <Badge className="bg-secondary/50 text-secondary-foreground border-secondary/30">
            <User className="h-3 w-3 mr-1" />
            Klient
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const initials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const coachCount = users.filter(u => u.role === 'coach').length;
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Zarządzanie użytkownikami
            </h1>
            <p className="text-muted-foreground">
              Przeglądaj i zarządzaj kontami użytkowników
            </p>
          </div>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Administratorów</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{coachCount}</p>
                <p className="text-sm text-muted-foreground">Trenerów</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clientCount}</p>
                <p className="text-sm text-muted-foreground">Klientów</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Wszyscy użytkownicy</CardTitle>
            <CardDescription>Lista wszystkich zarejestrowanych użytkowników w systemie</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak użytkowników</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rola</TableHead>
                    <TableHead>Data rejestracji</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={`${user.user_id}-${user.role}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {user.avatar_url && (
                              <AvatarImage src={user.avatar_url} alt={user.full_name || 'Avatar'} />
                            )}
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {initials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.full_name || 'Brak nazwy'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>
                        {user.user_id === currentUser?.id ? (
                          getRoleBadge(user.role)
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={(value: AppRole) => handleRoleChange(user.user_id, value)}
                            disabled={changingRole === user.user_id}
                          >
                            <SelectTrigger className="w-[140px]">
                              {changingRole === user.user_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-3 w-3 text-red-400" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="coach">
                                <div className="flex items-center gap-2">
                                  <UserCog className="h-3 w-3 text-primary" />
                                  Trener
                                </div>
                              </SelectItem>
                              <SelectItem value="client">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  Klient
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: pl })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Usuń użytkownika"
                          disabled={user.user_id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć tego użytkownika?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna. Konto użytkownika{' '}
                <strong>{userToDelete?.email || userToDelete?.full_name}</strong> zostanie
                trwale usunięte wraz ze wszystkimi powiązanymi danymi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Anuluj</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Usuń użytkownika
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
