import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Camera,
  Save,
  Settings
} from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    emailNewUser: true,
    emailSystemAlerts: true,
    pushNewUser: true,
    pushSystemAlerts: true,
  });

  const [appSettings, setAppSettings] = useState({
    language: "pl",
    theme: "dark",
    timeFormat: "24h",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone, bio')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać profilu.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil zapisany",
        description: "Twoje zmiany zostały zapisane pomyślnie.",
      });
    }
    setSaving(false);
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Ustawienia powiadomień zapisane",
      description: "Preferencje powiadomień zostały zaktualizowane.",
    });
  };

  const handleSaveAppSettings = () => {
    toast({
      title: "Ustawienia aplikacji zapisane",
      description: "Ustawienia aplikacji zostały zaktualizowane.",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ustawienia administratora</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj swoim profilem i ustawieniami systemu</p>
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-red-500/20 text-red-400 text-xl font-medium">
                      {getInitials(profile.full_name)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Imię i nazwisko</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted border-border"
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

                <div className="space-y-2">
                  <Label htmlFor="bio">O mnie</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="bg-background border-border min-h-[100px]"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Powiadomienia email</CardTitle>
                <CardDescription>Zarządzaj powiadomieniami systemowymi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy użytkownik</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o nowych rejestracjach</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewUser}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewUser: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alerty systemowe</p>
                    <p className="text-sm text-muted-foreground">Ważne powiadomienia o systemie</p>
                  </div>
                  <Switch
                    checked={notifications.emailSystemAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSystemAlerts: checked })}
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
                    <p className="text-sm text-muted-foreground">Push przy nowych rejestracjach</p>
                  </div>
                  <Switch
                    checked={notifications.pushNewUser}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNewUser: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alerty systemowe</p>
                    <p className="text-sm text-muted-foreground">Push z alertami systemowymi</p>
                  </div>
                  <Switch
                    checked={notifications.pushSystemAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushSystemAlerts: checked })}
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
                  <div className="space-y-2">
                    <Label>Format czasu</Label>
                    <Select
                      value={appSettings.timeFormat}
                      onValueChange={(value) => setAppSettings({ ...appSettings, timeFormat: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-godzinny</SelectItem>
                        <SelectItem value="12h">12-godzinny</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <CardTitle className="text-foreground">Zmiana hasła</CardTitle>
                <CardDescription>Zaktualizuj swoje hasło do logowania</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Obecne hasło</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-background border-border max-w-md"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Zmień hasło
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Weryfikacja dwuetapowa</CardTitle>
                <CardDescription>Dodatkowa warstwa bezpieczeństwa dla Twojego konta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weryfikacja SMS</p>
                    <p className="text-sm text-muted-foreground">Otrzymuj kody weryfikacyjne przez SMS</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Aplikacja autoryzacyjna</p>
                    <p className="text-sm text-muted-foreground">Użyj aplikacji jak Google Authenticator</p>
                  </div>
                  <Button variant="outline">Konfiguruj</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
