import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Save
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "Trening siłowy",
    experience_years: 0,
  });

  const [notifications, setNotifications] = useState({
    emailNewClient: true,
    emailSessionReminder: true,
    emailPayment: true,
    pushNewMessage: true,
    pushSessionReminder: true,
    pushPaymentOverdue: false,
    smsSessionReminder: false,
    smsPaymentReminder: true
  });

  const [appSettings, setAppSettings] = useState({
    language: "pl",
    theme: "dark",
    currency: "PLN",
    timeFormat: "24h",
    sessionDuration: "60",
    reminderTime: "24"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone, bio, specialization, experience_years, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          specialization: data.specialization || "Trening siłowy",
          experience_years: data.experience_years || 0,
        });
        setAvatarUrl(data.avatar_url);
      }

      const { data: settingsData } = await supabase
        .from('coach_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsData) {
        setAppSettings({
          language: settingsData.language || "pl",
          theme: settingsData.theme || "dark",
          currency: settingsData.currency || "PLN",
          timeFormat: "24h",
          sessionDuration: String(settingsData.default_session_duration || 60),
          reminderTime: String(settingsData.reminder_time || 24),
        });
        setNotifications({
          emailNewClient: settingsData.email_notifications ?? true,
          emailSessionReminder: settingsData.email_notifications ?? true,
          emailPayment: settingsData.email_notifications ?? true,
          pushNewMessage: settingsData.push_notifications ?? true,
          pushSessionReminder: settingsData.push_notifications ?? true,
          pushPaymentOverdue: false,
          smsSessionReminder: settingsData.sms_notifications ?? false,
          smsPaymentReminder: settingsData.sms_notifications ?? true,
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
        specialization: profile.specialization,
        experience_years: profile.experience_years,
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

  const handleSaveNotifications = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('coach_settings')
      .update({
        email_notifications: notifications.emailNewClient,
        push_notifications: notifications.pushNewMessage,
        sms_notifications: notifications.smsSessionReminder,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ustawienia powiadomień zapisane",
        description: "Preferencje powiadomień zostały zaktualizowane.",
      });
    }
  };

  const handleSaveAppSettings = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('coach_settings')
      .update({
        language: appSettings.language,
        theme: appSettings.theme,
        currency: appSettings.currency,
        default_session_duration: parseInt(appSettings.sessionDuration),
        reminder_time: parseInt(appSettings.reminderTime),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ustawienia aplikacji zapisane",
        description: "Ustawienia aplikacji zostały zaktualizowane.",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ustawienia trenera</h1>
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
                <CardDescription>Zaktualizuj swoje dane osobowe i informacje o trenerze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={avatarUrl}
                    fallbackText={getInitials(profile.full_name)}
                    onAvatarChange={handleAvatarChange}
                  />
                )}

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specjalizacja</Label>
                    <Select
                      value={profile.specialization}
                      onValueChange={(value) => setProfile({ ...profile, specialization: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trening siłowy">Trening siłowy</SelectItem>
                        <SelectItem value="Trening funkcjonalny">Trening funkcjonalny</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="Rehabilitacja">Rehabilitacja</SelectItem>
                        <SelectItem value="Dietetyka">Dietetyka</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Lata doświadczenia</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile.experience_years}
                      onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                      className="bg-background border-border"
                    />
                  </div>
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
                <CardDescription>Zarządzaj powiadomieniami wysyłanymi na email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Nowy klient</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o nowym kliencie</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewClient}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewClient: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Przypomnienie o sesji</p>
                    <p className="text-sm text-muted-foreground">Przypomnienie o nadchodzących sesjach</p>
                  </div>
                  <Switch
                    checked={notifications.emailSessionReminder}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSessionReminder: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Potwierdzenie płatności</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o otrzymanych płatnościach</p>
                  </div>
                  <Switch
                    checked={notifications.emailPayment}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailPayment: checked })}
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
                    <p className="font-medium text-foreground">Nowa wiadomość</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o nowych wiadomościach</p>
                  </div>
                  <Switch
                    checked={notifications.pushNewMessage}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNewMessage: checked })}
                  />
                </div>
                <Separator />
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
                    <p className="font-medium text-foreground">Zaległa płatność</p>
                    <p className="text-sm text-muted-foreground">Powiadomienie o zaległych płatnościach</p>
                  </div>
                  <Switch
                    checked={notifications.pushPaymentOverdue}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushPaymentOverdue: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Powiadomienia SMS</CardTitle>
                <CardDescription>Zarządzaj powiadomieniami SMS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Przypomnienie o sesji</p>
                    <p className="text-sm text-muted-foreground">SMS przed nadchodzącą sesją</p>
                  </div>
                  <Switch
                    checked={notifications.smsSessionReminder}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsSessionReminder: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Przypomnienie o płatności</p>
                    <p className="text-sm text-muted-foreground">SMS z przypomnieniem o płatności</p>
                  </div>
                  <Switch
                    checked={notifications.smsPaymentReminder}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsPaymentReminder: checked })}
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
                    <Label>Waluta</Label>
                    <Select
                      value={appSettings.currency}
                      onValueChange={(value) => setAppSettings({ ...appSettings, currency: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLN">PLN (zł)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
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

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ustawienia treningów</CardTitle>
                <CardDescription>Domyślne ustawienia dla sesji treningowych</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Domyślny czas trwania sesji (min)</Label>
                    <Select
                      value={appSettings.sessionDuration}
                      onValueChange={(value) => setAppSettings({ ...appSettings, sessionDuration: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minut</SelectItem>
                        <SelectItem value="45">45 minut</SelectItem>
                        <SelectItem value="60">60 minut</SelectItem>
                        <SelectItem value="90">90 minut</SelectItem>
                        <SelectItem value="120">120 minut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Czas przypomnienia przed sesją</Label>
                    <Select
                      value={appSettings.reminderTime}
                      onValueChange={(value) => setAppSettings({ ...appSettings, reminderTime: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 godzina</SelectItem>
                        <SelectItem value="2">2 godziny</SelectItem>
                        <SelectItem value="24">24 godziny</SelectItem>
                        <SelectItem value="48">48 godzin</SelectItem>
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

            <Card className="bg-card border-border border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Strefa niebezpieczna</CardTitle>
                <CardDescription>Nieodwracalne akcje na Twoim koncie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Usuń konto</p>
                    <p className="text-sm text-muted-foreground">Trwale usuń swoje konto i wszystkie dane</p>
                  </div>
                  <Button variant="destructive">Usuń konto</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
