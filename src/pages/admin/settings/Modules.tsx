import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ToggleLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { MODULE_KEYS, MODULE_CATALOG, type ModuleKey, type Modules } from '@/config/modules';

export default function ModulesSettings() {
  const { settings, updateSettings } = useSettings();
  const [modules, setModules] = useState<Modules>(settings.modules);
  const [saving, setSaving] = useState(false);

  useEffect(() => setModules(settings.modules), [settings.modules]);

  const toggle = (key: ModuleKey) => setModules((m) => ({ ...m, [key]: !m[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ modules });
      toast.success('Modules enregistrés.');
    } catch {
      toast.error('Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const dirty = MODULE_KEYS.some((k) => modules[k] !== settings.modules[k]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Modules</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Activez uniquement ce dont votre activité a besoin. Un module désactivé
            disparaît du site public comme de cette administration — ses données sont
            conservées et réapparaissent si vous le réactivez.
          </p>
        </CardHeader>

        <CardContent className="space-y-1">
          {MODULE_KEYS.map((key, i) => {
            const { label, description, affects } = MODULE_CATALOG[key];
            return (
              <div key={key}>
                {i > 0 && <Separator className="my-1" />}
                <div className="flex items-start justify-between gap-6 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">{affects}</p>
                  </div>
                  <Switch
                    checked={modules[key]}
                    onCheckedChange={() => toggle(key)}
                    aria-label={label}
                  />
                </div>
              </div>
            );
          })}

          <Separator className="my-2" />
          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={!dirty || saving} className="rounded-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}