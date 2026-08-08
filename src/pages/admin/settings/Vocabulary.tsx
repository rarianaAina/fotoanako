import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { LABEL_KEYS, LABEL_CATALOG, DEFAULT_LABELS, type Labels } from '@/config/labels';

/** Exemples de vocabulaire par métier, appliqués d'un clic. */
const PRESETS: { name: string; labels: Partial<Labels> }[] = [
  {
    name: 'Beauté / bien-être',
    labels: {
      customer: { one: 'Client', many: 'Clients' },
      service: { one: 'Prestation', many: 'Prestations' },
      staff: { one: 'Praticien', many: 'Praticiens' },
    },
  },
  {
    name: 'Santé',
    labels: {
      customer: { one: 'Patient', many: 'Patients' },
      service: { one: 'Séance', many: 'Séances' },
      booking: { one: 'Rendez-vous', many: 'Rendez-vous' },
      staff: { one: 'Praticien', many: 'Praticiens' },
    },
  },
  {
    name: 'Enseignement',
    labels: {
      customer: { one: 'Élève', many: 'Élèves' },
      service: { one: 'Cours', many: 'Cours' },
      booking: { one: 'Inscription', many: 'Inscriptions' },
      staff: { one: 'Professeur', many: 'Professeurs' },
    },
  },
];

export default function VocabularySettings() {
  const { settings, updateSettings } = useSettings();
  const [labels, setLabels] = useState<Labels>(settings.labels);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLabels(settings.labels), [settings.labels]);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ labels });
      toast.success('Vocabulaire enregistré.');
    } catch {
      toast.error('Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Vocabulaire</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Les mots employés dans toute l'application. Un cabinet parle de patients
            et de séances, une école d'élèves et de cours.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setLabels((l) => ({ ...DEFAULT_LABELS, ...l, ...preset.labels }))
                }
              >
                {preset.name}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            {LABEL_KEYS.map((key) => (
              <div key={key} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <p className="text-sm text-muted-foreground">{LABEL_CATALOG[key]}</p>
                <div className="space-y-1.5">
                  <Label htmlFor={`${key}-one`} className="text-xs">
                    Singulier
                  </Label>
                  <Input
                    id={`${key}-one`}
                    value={labels[key].one}
                    onChange={(e) =>
                      setLabels((l) => ({ ...l, [key]: { ...l[key], one: e.target.value } }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${key}-many`} className="text-xs">
                    Pluriel
                  </Label>
                  <Input
                    id={`${key}-many`}
                    value={labels[key].many}
                    onChange={(e) =>
                      setLabels((l) => ({ ...l, [key]: { ...l[key], many: e.target.value } }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <Separator />
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="rounded-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}