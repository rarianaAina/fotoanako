import { Save, Bell, User, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import type { ReminderDelay, ReminderRecipients } from '@/types/reminder';
import { useLabels } from '@/hooks/useLabels';

const DELAYS: { value: ReminderDelay; label: string }[] = [
  { value: 24, label: '24 heures avant' },
  { value: 12, label: '12 heures avant' },
  { value: 2, label: '2 heures avant' },
];

/**
 * Les intitulés dépendent du vocabulaire du déploiement — « la cliente »
 * ne convient ni à un cabinet ni à une école. Construits à l'exécution.
 */
function buildRecipients(
  customer: string,
): { value: ReminderRecipients; label: string; icon: typeof User; desc: string }[] {
  const c = customer.toLowerCase();
  return [
    {
      value: 'client',
      label: `${customer} uniquement`,
      icon: User,
      desc: `Le rappel est envoyé au ${c} seulement.`,
    },
    {
      value: 'admin',
      label: 'Administration uniquement',
      icon: ShieldCheck,
      desc: 'Le rappel vous est envoyé, pas au ' + c + '.',
    },
    {
      value: 'both',
      label: 'Les deux',
      icon: Users,
      desc: `Le rappel est envoyé au ${c} et à vous.`,
    },
  ];
}

export default function RemindersSettings() {
  const t = useLabels();
  const RECIPIENTS = buildRecipients(t('customer'));
  const { reminderSettings, updateReminderSettings } = useReminderSettings();

  const handleSave = async () => {
    if (!reminderSettings) return;
    await updateReminderSettings(reminderSettings);
    toast.success('Paramètres de rappels enregistrés.');
  };

  if (!reminderSettings) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Rappels automatiques</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{reminderSettings.enabled ? 'Activés' : 'Désactivés'}</span>
              <Switch
                checked={reminderSettings.enabled}
                onCheckedChange={(v) => updateReminderSettings({ enabled: v })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-6', !reminderSettings.enabled && 'pointer-events-none opacity-50')}>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
            <Bell className="mb-1.5 h-4 w-4" />
            <p className="font-medium">Prototype — rappels visuels uniquement</p>
            <p className="mt-1 text-primary/80">
              Les rappels sont enregistrés et affichés dans la section Notifications. Aucun SMS ou email n'est envoyé automatiquement pour l'instant.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Délai du rappel</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {DELAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => updateReminderSettings({ delayHours: d.value })}
                  className={cn(
                    'flex flex-col items-center rounded-2xl border p-4 text-center transition-all',
                    reminderSettings.delayHours === d.value
                      ? 'border-primary bg-primary/5 '
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <span className={cn('grid h-11 w-11 place-items-center  text-2xl font-bold',
                    reminderSettings.delayHours === d.value ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground')}>
                    {d.value}
                  </span>
                  <span className="mt-2 text-sm font-medium">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Destinataires</Label>
            <div className="space-y-2">
              {RECIPIENTS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateReminderSettings({ recipients: r.value })}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                    reminderSettings.recipients === r.value
                      ? 'border-primary bg-primary/5 '
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
                    reminderSettings.recipients === r.value ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground')}>
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                  {reminderSettings.recipients === r.value && (
                    <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center bg-primary text-primary-foreground">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-semibold">Coordonnées de l'administration</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="admin-phone">Téléphone admin</Label>
                <Input
                  id="admin-phone"
                  value={reminderSettings.adminPhone ?? ''}
                  onChange={(e) => updateReminderSettings({ adminPhone: e.target.value })}
                  placeholder="+33 ..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Email admin</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={reminderSettings.adminEmail ?? ''}
                  onChange={(e) => updateReminderSettings({ adminEmail: e.target.value })}
                  placeholder="admin@nida.mg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Enregistrer les rappels
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}