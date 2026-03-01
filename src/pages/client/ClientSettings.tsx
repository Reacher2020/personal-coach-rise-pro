import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AvatarUpload } from "@/components/AvatarUpload";
import { ClientSurveyEdit } from "@/components/ClientSurveyEdit";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Save,
  Mail,
  Phone,
  Calendar,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ClientSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    emailSessionReminder: true,
    emailNewWorkout: true,
    emailCoachMessage: true,
    pushSessionReminder: true,
    pushNewWorkout: true,
    pushCoachMessage: true,
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
        .select('full_name, email, phone, bio, avatar_url, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
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
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
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
      setProfile(prev => prev ? { ...prev, ...formData } : null);
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

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ustawienia</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj swoim profilem i preferencjami</p>
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
            <TabsTrigger value="survey" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="h-4 w-4 mr-2" />
              Ankieta
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="h-4 w-4 mr-2" />
              Bezpieczeństwo
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.full_name || "Użytkownik"}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {profile?.email || user?.email}
                    </p>
                    {profile?.created_at && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        Członek od {format(new Date(profile.created_at), "d MMMM yyyy", { locale: pl })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Edytuj profil</CardTitle>
                <CardDescription>Zaktualizuj swoje dane osobowe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={profile?.avatar_url || null}
                    fallbackText={getInitials(profile?.full_name)}
                    onAvatarChange={handleAvatarChange}
                  />
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Imię i nazwisko</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Jan Kowalski"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email || user?.email || ""}
                        disabled
                        className="pl-10 bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email nie może być zmieniony</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+48 123 456 789"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">O mnie</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Kilka słów o sobie, Twoich celach treningowych..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informacje o koncie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Status konta</span>
                  <span className="font-medium text-green-500">Aktywne</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Typ konta</span>
                  <span className="font-medium">Klient</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Powiadomienia email</CardTitle>
                <CardDescription>Zarządzaj powiadomieniami email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Przypomnienie o sesji</p>
                    <p className="text-sm text-muted-foreground">Email przed nadchodzącą sesją treningową</p>
                  </div>
                  <Switch
                    checked={notifications.emailSessionReminder}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSessionReminder: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy plan treningowy</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o nowym planie od trenera</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewWorkout}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewWorkout: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Wiadomość od trenera</p>
                    <p className="text-sm text-muted-foreground">Email o nowej wiadomości</p>
                  </div>
                  <Switch
                    checked={notifications.emailCoachMessage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailCoachMessage: checked })}
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
                    <p className="font-medium text-foreground">Przypomnienie o sesji</p>
                    <p className="text-sm text-muted-foreground">Push przed nadchodzącą sesją</p>
                  </div>
                  <Switch
                    checked={notifications.pushSessionReminder}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushSessionReminder: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy plan treningowy</p>
                    <p className="text-sm text-muted-foreground">Push o nowym planie od trenera</p>
                  </div>
                  <Switch
                    checked={notifications.pushNewWorkout}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNewWorkout: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Wiadomość od trenera</p>
                    <p className="text-sm text-muted-foreground">Push o nowej wiadomości</p>
                  </div>
                  <Switch
                    checked={notifications.pushCoachMessage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushCoachMessage: checked })}
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

          {/* Survey Tab */}
          <TabsContent value="survey" className="space-y-6">
            <ClientSurveyEdit />
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
