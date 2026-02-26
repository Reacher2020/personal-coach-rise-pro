import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ClipboardList, Target, Brain, History, HeartPulse, Moon, Calendar } from 'lucide-react';

interface ClientSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientUserId: string | null;
}

const LABELS: Record<string, Record<string, string>> = {
  primary_goal: {
    fat_loss: 'Redukcja tkanki tłuszczowej',
    muscle_gain: 'Budowa masy mięśniowej',
    endurance: 'Poprawa kondycji',
    health: 'Zdrowie / brak bólu',
    comeback: 'Powrót do formy po przerwie',
  },
  motivation_reason: {
    health: 'Zdrowie',
    appearance: 'Wygląd',
    wellbeing: 'Samopoczucie / energia',
    event: 'Wydarzenie / termin',
    other: 'Inne',
  },
  training_experience: {
    never: 'Nigdy nie trenował/a',
    irregular: 'Trenował/a nieregularnie',
    regular: 'Trenuje regularnie',
  },
  quit_reasons: {
    no_time: 'Brak czasu',
    no_results: 'Brak efektów',
    injuries: 'Kontuzje',
    no_motivation: 'Spadek motywacji',
    no_plan: 'Chaos / brak planu',
  },
  health_issues: {
    none: 'Brak problemów zdrowotnych',
    injuries: 'Kontuzje / bóle',
    spine: 'Problemy z kręgosłupem',
    joints: 'Problemy ze stawami',
    other: 'Inne ograniczenia',
  },
  sleep_hours: {
    '<6h': 'Poniżej 6h',
    '6-7h': '6–7h',
    '7-8h': '7–8h',
    '8h+': '8h+',
  },
  work_type: {
    sedentary: 'Siedząca',
    physical: 'Fizyczna',
    mixed: 'Mieszana',
  },
  stress_level: {
    low: 'Niski',
    medium: 'Średni',
    high: 'Wysoki',
  },
  gender: {
    male: 'Mężczyzna',
    female: 'Kobieta',
    other: 'Inna',
    prefer_not_to_say: 'Wolę nie podawać',
  },
};

const getLabel = (category: string, value: string) => LABELS[category]?.[value] || value;

interface SurveyData {
  full_name: string;
  age_range: string;
  gender: string | null;
  height_cm: number | null;
  starting_weight_kg: number | null;
  primary_goal: string | null;
  motivation_reason: string | null;
  motivation_level: number | null;
  training_experience: string | null;
  quit_reasons: string[] | null;
  health_issues: string[] | null;
  health_description: string | null;
  sleep_hours: string | null;
  work_type: string | null;
  stress_level: string | null;
  weekly_availability: string | null;
  completed_at: string;
}

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </h3>
    <div className="pl-6 space-y-1 text-sm text-muted-foreground">{children}</div>
  </div>
);

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
};

export const ClientSurveyDialog = ({ open, onOpenChange, clientName, clientUserId }: ClientSurveyDialogProps) => {
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!open || !clientUserId) return;
    setLoading(true);
    setNotFound(false);

    supabase
      .from('client_surveys')
      .select('*')
      .eq('user_id', clientUserId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setSurvey(null);
        } else {
          setSurvey(data as unknown as SurveyData);
        }
        setLoading(false);
      });
  }, [open, clientUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ankieta – {clientName}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && notFound && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {clientUserId ? 'Klient nie wypełnił jeszcze ankiety.' : 'Klient nie ma powiązanego konta.'}
          </p>
        )}

        {!loading && survey && (
          <div className="space-y-4">
            {/* 1. Informacje bazowe */}
            <Section icon={ClipboardList} title="Informacje bazowe">
              <Field label="Imię i nazwisko" value={survey.full_name} />
              <Field label="Wiek" value={survey.age_range} />
              <Field label="Płeć" value={survey.gender ? getLabel('gender', survey.gender) : null} />
              <Field label="Wzrost" value={survey.height_cm ? `${survey.height_cm} cm` : null} />
              <Field label="Waga startowa" value={survey.starting_weight_kg ? `${survey.starting_weight_kg} kg` : null} />
            </Section>

            {survey.primary_goal && (
              <>
                <Separator />
                <Section icon={Target} title="Główny cel">
                  <Badge variant="secondary">{getLabel('primary_goal', survey.primary_goal)}</Badge>
                </Section>
              </>
            )}

            {(survey.motivation_reason || survey.motivation_level) && (
              <>
                <Separator />
                <Section icon={Brain} title="Motywacja">
                  <Field label="Powód" value={survey.motivation_reason ? getLabel('motivation_reason', survey.motivation_reason) : null} />
                  {survey.motivation_level && (
                    <div className="flex justify-between">
                      <span>Poziom determinacji</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <span
                            key={n}
                            className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                              n <= survey.motivation_level! ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {survey.training_experience && (
              <>
                <Separator />
                <Section icon={History} title="Doświadczenie treningowe">
                  <Field label="Poziom" value={getLabel('training_experience', survey.training_experience)} />
                  {survey.quit_reasons && survey.quit_reasons.length > 0 && (
                    <div>
                      <span className="block mb-1">Powody rezygnacji:</span>
                      <div className="flex flex-wrap gap-1">
                        {survey.quit_reasons.map(r => (
                          <Badge key={r} variant="outline" className="text-xs">{getLabel('quit_reasons', r)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {survey.health_issues && survey.health_issues.length > 0 && (
              <>
                <Separator />
                <Section icon={HeartPulse} title="Zdrowie i ograniczenia">
                  <div className="flex flex-wrap gap-1">
                    {survey.health_issues.map(h => (
                      <Badge key={h} variant={h === 'none' ? 'secondary' : 'destructive'} className="text-xs">
                        {getLabel('health_issues', h)}
                      </Badge>
                    ))}
                  </div>
                  {survey.health_description && (
                    <p className="text-foreground italic mt-1">„{survey.health_description}"</p>
                  )}
                </Section>
              </>
            )}

            {(survey.sleep_hours || survey.work_type || survey.stress_level) && (
              <>
                <Separator />
                <Section icon={Moon} title="Regeneracja i styl życia">
                  <Field label="Sen" value={survey.sleep_hours ? getLabel('sleep_hours', survey.sleep_hours) : null} />
                  <Field label="Praca" value={survey.work_type ? getLabel('work_type', survey.work_type) : null} />
                  <Field label="Stres" value={survey.stress_level ? getLabel('stress_level', survey.stress_level) : null} />
                </Section>
              </>
            )}

            {survey.weekly_availability && (
              <>
                <Separator />
                <Section icon={Calendar} title="Dostępność">
                  <Field label="Treningi w tygodniu" value={survey.weekly_availability} />
                </Section>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
