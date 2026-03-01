import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, ClipboardList, Target, Brain, History, HeartPulse, Moon, Calendar } from 'lucide-react';

const RadioOption = ({ value, label, name }: { value: string; label: string; name: string }) => (
  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
    <RadioGroupItem value={value} id={`edit-${name}-${value}`} />
    <Label htmlFor={`edit-${name}-${value}`} className="cursor-pointer font-normal">{label}</Label>
  </div>
);

const CheckboxOption = ({ value, label, checked, onToggle }: { value: string; label: string; checked: boolean; onToggle: () => void }) => (
  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={onToggle}>
    <Checkbox checked={checked} onCheckedChange={onToggle} />
    <Label className="cursor-pointer font-normal">{label}</Label>
  </div>
);

const Section = ({ icon: Icon, title, description, children }: { icon: any; title: string; description?: string; children: React.ReactNode }) => (
  <Card className="bg-card border-border">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export const ClientSurveyEdit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [surveyExists, setSurveyExists] = useState(false);

  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [startingWeightKg, setStartingWeightKg] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [motivationReason, setMotivationReason] = useState('');
  const [motivationLevel, setMotivationLevel] = useState('');
  const [trainingExperience, setTrainingExperience] = useState('');
  const [quitReasons, setQuitReasons] = useState<string[]>([]);
  const [healthIssues, setHealthIssues] = useState<string[]>([]);
  const [healthDescription, setHealthDescription] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [workType, setWorkType] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [weeklyAvailability, setWeeklyAvailability] = useState('');

  const toggleArrayValue = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  useEffect(() => {
    if (!user) return;
    const fetchSurvey = async () => {
      const { data } = await supabase
        .from('client_surveys')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSurveyExists(true);
        setFullName(data.full_name || '');
        setAgeRange(data.age_range || '');
        setGender(data.gender || '');
        setHeightCm(data.height_cm ? String(data.height_cm) : '');
        setStartingWeightKg(data.starting_weight_kg ? String(data.starting_weight_kg) : '');
        setPrimaryGoal(data.primary_goal || '');
        setMotivationReason(data.motivation_reason || '');
        setMotivationLevel(data.motivation_level ? String(data.motivation_level) : '');
        setTrainingExperience(data.training_experience || '');
        setQuitReasons(data.quit_reasons || []);
        setHealthIssues(data.health_issues || []);
        setHealthDescription(data.health_description || '');
        setSleepHours(data.sleep_hours || '');
        setWorkType(data.work_type || '');
        setStressLevel(data.stress_level || '');
        setWeeklyAvailability(data.weekly_availability || '');
      }
      setLoading(false);
    };
    fetchSurvey();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim() || !ageRange) {
      toast({ title: 'Błąd', description: 'Imię i przedział wiekowy są wymagane.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const surveyData = {
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
    };

    let error;
    if (surveyExists) {
      ({ error } = await supabase.from('client_surveys').update(surveyData).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('client_surveys').insert(surveyData));
    }

    if (!error) {
      await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('user_id', user.id);
      toast({ title: 'Ankieta zapisana', description: 'Twoje odpowiedzi zostały zaktualizowane.' });
      setSurveyExists(true);
    } else {
      toast({ title: 'Błąd', description: 'Nie udało się zapisać ankiety.', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!surveyExists) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nie wypełniłeś jeszcze ankiety onboardingowej.</p>
          <p className="text-sm text-muted-foreground mt-1">Ankieta pojawi się tutaj po jej wypełnieniu.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Section icon={ClipboardList} title="Informacje bazowe" description="Dane identyfikacyjne">
        <div className="space-y-2">
          <Label>Imię i nazwisko *</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jan Kowalski" />
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
          <Label>Płeć</Label>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Wzrost (cm)</Label>
            <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" min={100} max={250} />
          </div>
          <div className="space-y-2">
            <Label>Waga (kg)</Label>
            <Input type="number" value={startingWeightKg} onChange={(e) => setStartingWeightKg(e.target.value)} placeholder="75" min={20} max={300} step={0.1} />
          </div>
        </div>
      </Section>

      <Section icon={Target} title="Główny cel" description="Co jest najważniejsze w ciągu najbliższych 12 tygodni?">
        <RadioGroup value={primaryGoal} onValueChange={setPrimaryGoal} className="space-y-2">
          <RadioOption value="fat_loss" label="Redukcja tkanki tłuszczowej" name="goal" />
          <RadioOption value="muscle_gain" label="Budowa masy mięśniowej" name="goal" />
          <RadioOption value="endurance" label="Poprawa kondycji" name="goal" />
          <RadioOption value="health" label="Zdrowie / brak bólu" name="goal" />
          <RadioOption value="comeback" label="Powrót do formy po przerwie" name="goal" />
        </RadioGroup>
      </Section>

      <Section icon={Brain} title="Motywacja" description="Dlaczego to jest dla Ciebie ważne?">
        <div className="space-y-2">
          <Label>Powód</Label>
          <RadioGroup value={motivationReason} onValueChange={setMotivationReason} className="space-y-2">
            <RadioOption value="health" label="Zdrowie" name="motivation" />
            <RadioOption value="appearance" label="Wygląd" name="motivation" />
            <RadioOption value="wellbeing" label="Samopoczucie / energia" name="motivation" />
            <RadioOption value="event" label="Wydarzenie / termin" name="motivation" />
            <RadioOption value="other" label="Inne" name="motivation" />
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Poziom determinacji</Label>
          <RadioGroup value={motivationLevel} onValueChange={setMotivationLevel} className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="flex flex-col items-center border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={String(n)} id={`edit-level-${n}`} />
                <Label htmlFor={`edit-level-${n}`} className="cursor-pointer font-bold mt-1">{n}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Section>

      <Section icon={History} title="Doświadczenie treningowe">
        <div className="space-y-2">
          <Label>Poziom doświadczenia</Label>
          <RadioGroup value={trainingExperience} onValueChange={setTrainingExperience} className="space-y-2">
            <RadioOption value="never" label="Nigdy nie trenowałem/am" name="exp" />
            <RadioOption value="irregular" label="Trenowałem/am nieregularnie" name="exp" />
            <RadioOption value="regular" label="Trenuję regularnie" name="exp" />
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label>Powody rezygnacji z treningu</Label>
          {[
            { value: 'no_time', label: 'Brak czasu' },
            { value: 'no_results', label: 'Brak efektów' },
            { value: 'injuries', label: 'Kontuzje' },
            { value: 'no_motivation', label: 'Spadek motywacji' },
            { value: 'no_plan', label: 'Chaos / brak planu' },
          ].map(opt => (
            <CheckboxOption key={opt.value} value={opt.value} label={opt.label} checked={quitReasons.includes(opt.value)} onToggle={() => toggleArrayValue(quitReasons, opt.value, setQuitReasons)} />
          ))}
        </div>
      </Section>

      <Section icon={HeartPulse} title="Zdrowie i ograniczenia">
        {[
          { value: 'none', label: 'Brak problemów zdrowotnych' },
          { value: 'injuries', label: 'Kontuzje / bóle' },
          { value: 'spine', label: 'Problemy z kręgosłupem' },
          { value: 'joints', label: 'Problemy ze stawami' },
          { value: 'other', label: 'Inne ograniczenia' },
        ].map(opt => (
          <CheckboxOption key={opt.value} value={opt.value} label={opt.label} checked={healthIssues.includes(opt.value)} onToggle={() => toggleArrayValue(healthIssues, opt.value, setHealthIssues)} />
        ))}
        {healthIssues.some(v => v !== 'none') && (
          <div className="space-y-2">
            <Label>Opis</Label>
            <Textarea value={healthDescription} onChange={(e) => setHealthDescription(e.target.value)} placeholder="Opisz swoje ograniczenia..." maxLength={500} />
          </div>
        )}
      </Section>

      <Section icon={Moon} title="Regeneracja i styl życia">
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
      </Section>

      <Section icon={Calendar} title="Dostępność" description="Ile treningów realnie zmieścisz w tygodniu?">
        <RadioGroup value={weeklyAvailability} onValueChange={setWeeklyAvailability} className="grid grid-cols-2 gap-2">
          <RadioOption value="2" label="2 treningi" name="avail" />
          <RadioOption value="3" label="3 treningi" name="avail" />
          <RadioOption value="4" label="4 treningi" name="avail" />
          <RadioOption value="5+" label="5+ treningów" name="avail" />
        </RadioGroup>
      </Section>

      <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Zapisywanie...' : 'Zapisz zmiany ankiety'}
      </Button>
    </div>
  );
};
