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
import { Dumbbell, Loader2, ClipboardList } from 'lucide-react';
import { z } from 'zod';

const surveySchema = z.object({
  full_name: z.string().trim().min(1, 'Imię i nazwisko jest wymagane').max(100),
  age_range: z.string().min(1, 'Wybierz przedział wiekowy'),
  gender: z.string().optional(),
  height_cm: z.number().min(100).max(250).optional().or(z.literal(undefined)),
  starting_weight_kg: z.number().min(20).max(300).optional().or(z.literal(undefined)),
});

const ClientOnboardingSurvey = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [startingWeightKg, setStartingWeightKg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const parsed = surveySchema.safeParse({
      full_name: fullName,
      age_range: ageRange,
      gender: gender || undefined,
      height_cm: heightCm ? Number(heightCm) : undefined,
      starting_weight_kg: startingWeightKg ? Number(startingWeightKg) : undefined,
    });

    if (!parsed.success) {
      toast({
        title: 'Błąd',
        description: parsed.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from('client_surveys').insert({
      user_id: user.id,
      full_name: parsed.data.full_name,
      age_range: parsed.data.age_range,
      gender: parsed.data.gender || null,
      height_cm: parsed.data.height_cm || null,
      starting_weight_kg: parsed.data.starting_weight_kg || null,
    });
    setIsLoading(false);

    if (error) {
      toast({ title: 'Błąd', description: 'Nie udało się zapisać ankiety.', variant: 'destructive' });
      return;
    }

    // Update profile full_name if provided
    await supabase.from('profiles').update({ full_name: parsed.data.full_name }).eq('user_id', user.id);

    toast({ title: 'Ankieta zapisana!', description: 'Witamy w systemie.' });
    navigate('/client', { replace: true });
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
            <p className="text-muted-foreground text-sm mt-1">Wypełnij podstawowe informacje</p>
          </div>
        </div>

        <Card className="border-border shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Informacje bazowe
            </CardTitle>
            <CardDescription>
              Dane identyfikacyjne – pomogą Twojemu trenerowi lepiej dostosować plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="survey-name">Imię i nazwisko *</Label>
                <Input
                  id="survey-name"
                  placeholder="Jan Kowalski"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <Label>Wiek (przedział) *</Label>
                <RadioGroup value={ageRange} onValueChange={setAgeRange} className="grid grid-cols-2 gap-2">
                  {[
                    { value: '<25', label: 'Poniżej 25' },
                    { value: '25-34', label: '25–34' },
                    { value: '35-44', label: '35–44' },
                    { value: '45+', label: '45+' },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={opt.value} id={`age-${opt.value}`} />
                      <Label htmlFor={`age-${opt.value}`} className="cursor-pointer font-normal">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Płeć (opcjonalnie)</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Mężczyzna</SelectItem>
                    <SelectItem value="female">Kobieta</SelectItem>
                    <SelectItem value="other">Inna</SelectItem>
                    <SelectItem value="prefer_not_to_say">Wolę nie podawać</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="survey-height">Wzrost w cm (opcjonalnie)</Label>
                <Input
                  id="survey-height"
                  type="number"
                  placeholder="175"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Starting Weight */}
              <div className="space-y-2">
                <Label htmlFor="survey-weight">Waga początkowa w kg (opcjonalnie)</Label>
                <Input
                  id="survey-weight"
                  type="number"
                  placeholder="75"
                  min={20}
                  max={300}
                  step={0.1}
                  value={startingWeightKg}
                  onChange={(e) => setStartingWeightKg(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  'Zapisz i przejdź dalej'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOnboardingSurvey;
