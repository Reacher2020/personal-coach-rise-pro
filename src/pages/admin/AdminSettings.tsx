import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Coach_Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Camera,
  Save,
  Key,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewUser: true,
    emailSecurityAlert: true,
    emailSystemUpdate: true,
    pushNewUser: true,
    pushSecurityAlert: true,
  });

  // App settings
  const [appSettings, setAppSettings] = useState({
    language: 'pl',
    theme: 'dark',
    sessionTimeout: '60',
  });

  // Password change
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          fullName: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
        });
      } else {
        setProfile({
          fullName: '',
          email: user.email || '',
          phone: '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać profilu',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Profil zapisany',
        description: 'Twoje zmiany zostały zapisane pomyślnie.',
      });
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Ustawienia powiadomień zapisane',
      description: 'Preferencje powiadomień zostały zaktualizowane.',
    });
  };

  const handleSaveAppSettings = () => {
    toast({
      title: 'Ustawienia aplikacji zapisane',
      description: 'Ustawienia aplikacji zostały zaktualizowane.',
    });
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Błąd',
        description: 'Nowe hasła nie są identyczne.',
        variant: 'destructive',
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Błąd',
        description: 'Hasło musi mieć co najmniej 6 znaków.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast({
        title: 'Hasło zmienione',
        description: 'Twoje hasło zostało zmienione pomyślnie.',
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getInitials = () => {
    if (profile.fullName) {
      const names = profile.fullName.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'AD';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ustawienia administratora</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj swoim kontem i preferencjami</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4 mr-2" />
              Powiadomienia
            </TabsTrigger>
            <TabsTrigger value="app" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="h-4 w-4 mr-2" />
              Aplikacja
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Bezpieczeństwo
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informacje o profilu</CardTitle>
                <CardDescription>Zaktualizuj swoje dane osobowe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-red-500/20 text-red-400 text-xl font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="mb-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Zmień zdjęcie
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG lub GIF. Max 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Imię i nazwisko</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz zmiany
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Powiadomienia email</CardTitle>
                <CardDescription>Zarządzaj powiadomieniami wysyłanymi na email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy użytkownik</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o nowym użytkowniku w systemie</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewUser}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewUser: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alerty bezpieczeństwa</p>
                    <p className="text-sm text-muted-foreground">Powiadomienia o podejrzanej aktywności</p>
                  </div>
                  <Switch
                    checked={notifications.emailSecurityAlert}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSecurityAlert: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Aktualizacje systemu</p>
                    <p className="text-sm text-muted-foreground">Powiadomienia o aktualizacjach aplikacji</p>
                  </div>
                  <Switch
                    checked={notifications.emailSystemUpdate}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSystemUpdate: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Powiadomienia push</CardTitle>
                <CardDescription>Zarządzaj powiadomieniami push w aplikacji</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy użytkownik</p>
                    <p className="text-sm text-muted-foreground">Push przy rejestracji nowego użytkownika</p>
                  </div>
                  <Switch
                    checked={notifications.pushNewUser}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNewUser: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alerty bezpieczeństwa</p>
                    <p className="text-sm text-muted-foreground">Natychmiastowe alerty o zagrożeniach</p>
                  </div>
                  <Switch
                    checked={notifications.pushSecurityAlert}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushSecurityAlert: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveNotifications} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Zapisz ustawienia powiadomień
            </Button>
          </TabsContent>

          {/* App Settings Tab */}
          <TabsContent value="app" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ustawienia ogólne</CardTitle>
                <CardDescription>Dostosuj wygląd i zachowanie aplikacji</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Język</Label>
                    <Select
                      value={appSettings.language}
                      onValueChange={(value) => setAppSettings({ ...appSettings, language: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pl">Polski</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Motyw</Label>
                    <Select
                      value={appSettings.theme}
                      onValueChange={(value) => setAppSettings({ ...appSettings, theme: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Ciemny</SelectItem>
                        <SelectItem value="light">Jasny</SelectItem>
                        <SelectItem value="system">Systemowy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timeout sesji (minuty)</Label>
                  <Select
                    value={appSettings.sessionTimeout}
                    onValueChange={(value) => setAppSettings({ ...appSettings, sessionTimeout: value })}
                  >
                    <SelectTrigger className="bg-background border-border w-full md:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minut</SelectItem>
                      <SelectItem value="60">1 godzina</SelectItem>
                      <SelectItem value="120">2 godziny</SelectItem>
                      <SelectItem value="480">8 godzin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveAppSettings} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Zapisz ustawienia aplikacji
            </Button>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Zmień hasło</CardTitle>
                <CardDescription>Zaktualizuj swoje hasło do konta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Obecne hasło</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <Button onClick={handleChangePassword} variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Zmień hasło
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Strefa zagrożenia</CardTitle>
                <CardDescription>Nieodwracalne akcje dotyczące Twojego konta</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń konto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Usuń konto
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
