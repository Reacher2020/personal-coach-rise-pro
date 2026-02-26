import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dumbbell, Loader2, ClipboardList, Target, Brain, History, HeartPulse, Moon, Calendar } from 'lucide-react';

const ClientOnboardingSurvey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Section 1
  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [startingWeightKg, setStartingWeightKg] = useState('');

  // Section 2
  const [primaryGoal, setPrimaryGoal] = useState('');

  // Section 3
  const [motivationReason, setMotivationReason] = useState('');
  const [motivationLevel, setMotivationLevel] = useState('');

  // Section 4
  const [trainingExperience, setTrainingExperience] = useState('');
  const [quitReasons, setQuitReasons] = useState<string[]>([]);

  // Section 5
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [healthDescription, setHealthDescription] = useState('');

  // Section 6
  const [sleepHours, setSleepHours] = useState('');
  const [workType, setWorkType] = useState('');
  const [stressLevel, setStressLevel] = useState('');

  // Section 7
  const [weeklyAvailability, setWeeklyAvailability] = useState('');

  const toggleArrayValue = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!fullName.trim() || !ageRange) {
          toast({ title: 'Błąd', description: 'Imię i przedział wiekowy są wymagane.', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        if (!primaryGoal) {
          toast({ title: 'Błąd', description: 'Wybierz główny cel.', variant: 'destructive' });
          return false;
        }
        return true;
      case 3:
        if (!motivationReason || !motivationLevel) {
          toast({ title: 'Błąd', description: 'Odpowiedz na oba pytania.', variant: 'destructive' });
          return false;
        }
        return true;
      case 4:
        if (!trainingExperience) {
          toast({ title: 'Błąd', description: 'Wybierz poziom doświadczenia.', variant: 'destructive' });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateStep()) return;

    setIsLoading(true);
    const { error } = await supabase.from('client_surveys').insert({
      user_id: user.id,
      full_name: fullName.trim(),
      age_range: ageRange,
      gender: gender || null,
      height_cm: heightCm ? Number(heightCm) : null,
      starting_weight_kg: startingWeightKg ? Number(startingWeightKg) : null,
      primary_goal: primaryGoal || null,
      motivation_reason: motivationReason || null,
      motivation_level: motivationLevel ? Number(motivationLevel) : null,
      training_experience: trainingExperience || null,
      quit_reasons: quitReasons.length > 0 ? quitReasons : null,
      health_issues: healthIssues.length > 0 ? healthIssues : null,
      health_description: healthDescription || null,
      sleep_hours: sleepHours || null,
      work_type: workType || null,
      stress_level: stressLevel || null,
      weekly_availability: weeklyAvailability || null,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Błąd', description: 'Nie udało się zapisać ankiety.', variant: 'destructive' });
      return;
    }

    await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('user_id', user.id);

    toast({ title: 'Ankieta zapisana!', description: 'Witamy w systemie.' });
    navigate('/client', { replace: true });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i + 1 === step ? 'w-8 bg-primary' : i + 1 < step ? 'w-2 bg-primary/60' : 'w-2 bg-muted'
          }`}
        />
      ))}
    </div>
  );

  const RadioOption = ({ value, label, name }: { value: string; label: string; name: string }) => (
    <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
      <RadioGroupItem value={value} id={`${name}-${value}`} />
      <Label htmlFor={`${name}-${value}`} className="cursor-pointer font-normal">{label}</Label>
    </div>
  );

  const CheckboxOption = ({ value, label, checked, onToggle }: { value: string; label: string; checked: boolean; onToggle: () => void }) => (
    <div
      className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onToggle}
    >
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <Label className="cursor-pointer font-normal">{label}</Label>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Informacje bazowe
              </CardTitle>
              <CardDescription>Dane identyfikacyjne – pomogą Twojemu trenerowi lepiej dostosować plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="survey-name">Imię i nazwisko *</Label>
                <Input id="survey-name" placeholder="Jan Kowalski" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label>Wiek (przedział) *</Label>
                <RadioGroup value={ageRange} onValueChange={setAgeRange} className="grid grid-cols-2 gap-2">
                  <RadioOption value="<25" label="Poniżej 25" name="age" />
                  <RadioOption value="25-34" label="25–34" name="age" />
                  <RadioOption value="35-44" label="35–44" name="age" />
                  <RadioOption value="45+" label="45+" name="age" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Płeć (opcjonalnie)</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Mężczyzna</SelectItem>
                    <SelectItem value="female">Kobieta</SelectItem>
                    <SelectItem value="other">Inna</SelectItem>
                    <SelectItem value="prefer_not_to_say">Wolę nie podawać</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-height">Wzrost w cm (opcjonalnie)</Label>
                <Input id="survey-height" type="number" placeholder="175" min={100} max={250} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-weight">Waga początkowa w kg (opcjonalnie)</Label>
                <Input id="survey-weight" type="number" placeholder="75" min={20} max={300} step={0.1} value={startingWeightKg} onChange={(e) => setStartingWeightKg(e.target.value)} disabled={isLoading} />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Główny cel
              </CardTitle>
              <CardDescription>Co jest dla Ciebie NAJWAŻNIEJSZE w ciągu najbliższych 12 tygodni?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} className="space-y-2">
                <RadioOption value="fat_loss" label="Redukcja tkanki tłuszczowej" name="goal" />
                <RadioOption value="muscle_gain" label="Budowa masy mięśniowej" name="goal" />
                <RadioOption value="endurance" label="Poprawa kondycji" name="goal" />
                <RadioOption value="health" label="Zdrowie / brak bólu" name="goal" />
                <RadioOption value="comeback" label="Powrót do formy po przerwie" name="goal" />
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Motywacja
              </CardTitle>
              <CardDescription>Dlaczego to jest dla Ciebie ważne TERAZ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Powód *</Label>
                <RadioGroup value={motivationReason} onValueChange={setMotivationReason} className="space-y-2">
                  <RadioOption value="health" label="Zdrowie" name="motivation" />
                  <RadioOption value="appearance" label="Wygląd" name="motivation" />
                  <RadioOption value="wellbeing" label="Samopoczucie / energia" name="motivation" />
                  <RadioOption value="event" label="Wydarzenie / termin" name="motivation" />
                  <RadioOption value="other" label="Inne" name="motivation" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Jak bardzo zależy Ci na efekcie? *</Label>
                <RadioGroup value={motivationLevel} onValueChange={setMotivationLevel} className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="flex flex-col items-center border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={String(n)} id={`level-${n}`} />
                      <Label htmlFor={`level-${n}`} className="cursor-pointer font-bold mt-1">{n}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Doświadczenie treningowe
              </CardTitle>
              <CardDescription>Twoja historia aktywności fizycznej.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Poziom doświadczenia *</Label>
                <RadioGroup value={trainingExperience} onValueChange={setTrainingExperience} className="space-y-2">
                  <RadioOption value="never" label="Nigdy nie trenowałem/am" name="exp" />
                  <RadioOption value="irregular" label="Trenowałem/am nieregularnie" name="exp" />
                  <RadioOption value="regular" label="Trenuję regularnie" name="exp" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Co wcześniej sprawiało, że przestawałeś/aś trenować? (opcjonalnie)</Label>
                <div className="space-y-2">
                  {[
                    { value: 'no_time', label: 'Brak czasu' },
                    { value: 'no_results', label: 'Brak efektów' },
                    { value: 'injuries', label: 'Kontuzje' },
                    { value: 'no_motivation', label: 'Spadek motywacji' },
                    { value: 'no_plan', label: 'Chaos / brak planu' },
                  ].map(opt => (
                    <CheckboxOption
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      checked={quitReasons.includes(opt.value)}
                      onToggle={() => toggleArrayValue(quitReasons, opt.value, setQuitReasons)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Zdrowie i ograniczenia
              </CardTitle>
              <CardDescription>Informacje o zdrowiu – minimum potrzebne do bezpiecznego treningu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  { value: 'none', label: 'Brak problemów zdrowotnych' },
                  { value: 'injuries', label: 'Kontuzje / bóle' },
                  { value: 'spine', label: 'Problemy z kręgosłupem' },
                  { value: 'joints', label: 'Problemy ze stawami' },
                  { value: 'other', label: 'Inne istotne ograniczenia' },
                ].map(opt => (
                  <CheckboxOption
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    checked={healthIssues.includes(opt.value)}
                    onToggle={() => toggleArrayValue(healthIssues, opt.value, setHealthIssues)}
                  />
                ))}
              </div>
              {healthIssues.some(v => v !== 'none') && (
                <div className="space-y-2">
                  <Label htmlFor="health-desc">Krótki opis (opcjonalnie)</Label>
                  <Textarea id="health-desc" placeholder="Opisz swoje ograniczenia..." value={healthDescription} onChange={(e) => setHealthDescription(e.target.value)} maxLength={500} />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                Regeneracja i styl życia
              </CardTitle>
              <CardDescription>Sygnały przeciążenia i regeneracji.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Sen</Label>
                <RadioGroup value={sleepHours} onValueChange={setSleepHours} className="grid grid-cols-2 gap-2">
                  <RadioOption value="<6h" label="Poniżej 6h" name="sleep" />
                  <RadioOption value="6-7h" label="6–7h" name="sleep" />
                  <RadioOption value="7-8h" label="7–8h" name="sleep" />
                  <RadioOption value="8h+" label="8h+" name="sleep" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Rodzaj pracy</Label>
                <RadioGroup value={workType} onValueChange={setWorkType} className="space-y-2">
                  <RadioOption value="sedentary" label="Siedząca" name="work" />
                  <RadioOption value="physical" label="Fizyczna" name="work" />
                  <RadioOption value="mixed" label="Mieszana" name="work" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Poziom stresu</Label>
                <RadioGroup value={stressLevel} onValueChange={setStressLevel} className="space-y-2">
                  <RadioOption value="low" label="Niski" name="stress" />
                  <RadioOption value="medium" label="Średni" name="stress" />
                  <RadioOption value="high" label="Wysoki" name="stress" />
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="border-border shadow-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Dostępność czasowa
              </CardTitle>
              <CardDescription>Ile realnie możesz trenować w tygodniu?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={weeklyAvailability} onValueChange={setWeeklyAvailability} className="grid grid-cols-2 gap-2">
                <RadioOption value="1x" label="1x w tygodniu" name="avail" />
                <RadioOption value="2x" label="2x w tygodniu" name="avail" />
                <RadioOption value="3x" label="3x w tygodniu" name="avail" />
                <RadioOption value="4x+" label="4x+ w tygodniu" name="avail" />
              </RadioGroup>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Dumbbell className="h-8 w-8 text-hero-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Ankieta startowa</h1>
            <p className="text-muted-foreground text-sm mt-1">Krok {step} z {totalSteps}</p>
          </div>
        </div>

        {renderStepIndicator()}
        {renderStep()}

        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1" disabled={isLoading}>
              Wstecz
            </Button>
          )}
          {step < totalSteps ? (
            <Button onClick={handleNext} className="flex-1" disabled={isLoading}>
              Dalej
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zapisz i przejdź dalej'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOnboardingSurvey;
