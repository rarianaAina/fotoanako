import { useState } from 'react';
import { Images, Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useImageSlots } from '@/hooks/useImageSlots';
import { useLowerLabel } from '@/hooks/useLabels';

/** Réduit un intitulé à une clé stable : « Photo d'inspiration » → « photo-d-inspiration ». */
function toKey(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export default function ImageSlotsSettings() {
  const { slots, loading, createSlot, updateSlot, removeSlot } = useImageSlots();
  const customer = useLowerLabel('customer');

  const [newLabel, setNewLabel] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const label = newLabel.trim();
    if (!label) return;

    const key = toKey(label);
    if (!key) {
      toast.error('Intitulé invalide.');
      return;
    }
    if (slots.some((s) => s.key === key)) {
      toast.error('Un emplacement porte déjà ce nom.');
      return;
    }

    setBusy(true);
    try {
      await createSlot({ label, key, sortOrder: slots.length });
      setNewLabel('');
      toast.success('Emplacement ajouté.');
    } catch {
      toast.error('Ajout impossible.');
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, data: Parameters<typeof updateSlot>[1]) => {
    try {
      await updateSlot(id, data);
    } catch {
      toast.error('Modification impossible.');
    }
  };

  const drop = async (id: string, label: string) => {
    if (!confirm(`Supprimer l'emplacement « ${label} » ?`)) return;
    try {
      await removeSlot(id);
      toast.success('Emplacement supprimé.');
    } catch {
      toast.error('Suppression impossible.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Images de référence</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Les photos demandées au {customer} au moment de la réservation. Un
            tatoueur demandera l'emplacement et une inspiration, un carrossier des
            photos des dégâts.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {slots.length === 0 && (
            <p className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Aucun emplacement. Sans emplacement configuré, l'étape photos
              n'apparaît pas dans le formulaire de réservation.
            </p>
          )}

          {slots.map((slot) => (
            <div key={slot.id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex items-start gap-3">
                <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/50" />

                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`label-${slot.id}`}>Intitulé</Label>
                    <Input
                      id={`label-${slot.id}`}
                      defaultValue={slot.label}
                      onBlur={(e) =>
                        e.target.value.trim() !== slot.label &&
                        patch(slot.id, { label: e.target.value.trim() })
                      }
                    />
                    {/* La clé est figée : les rendez-vous déjà pris y font
                        référence, la renommer les orphelinerait. */}
                    <p className="text-xs text-muted-foreground">
                      Clé technique : <code>{slot.key}</code>
                    </p>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`hint-${slot.id}`}>Aide affichée (optionnel)</Label>
                    <Input
                      id={`hint-${slot.id}`}
                      defaultValue={slot.hint ?? ''}
                      placeholder="Précisez ce que la photo doit montrer"
                      onBlur={(e) =>
                        e.target.value !== (slot.hint ?? '') &&
                        patch(slot.id, { hint: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`max-${slot.id}`}>Nombre maximum de photos</Label>
                    <Input
                      id={`max-${slot.id}`}
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={slot.maxFiles}
                      onBlur={(e) => {
                        const n = Math.min(20, Math.max(1, Number(e.target.value)));
                        if (n !== slot.maxFiles) patch(slot.id, { maxFiles: n });
                      }}
                    />
                  </div>

                  <div className="flex items-end gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={slot.required}
                        onCheckedChange={(v) => patch(slot.id, { required: v })}
                      />
                      Obligatoire
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={slot.active}
                        onCheckedChange={(v) => patch(slot.id, { active: v })}
                      />
                      Actif
                    </label>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => drop(slot.id, slot.label)}
                  aria-label={`Supprimer ${slot.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[16rem] flex-1 space-y-1.5">
              <Label htmlFor="new-slot">Nouvel emplacement</Label>
              <Input
                id="new-slot"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="Photo d'inspiration, Ordonnance, Dégâts…"
              />
            </div>
            <Button onClick={add} disabled={!newLabel.trim() || busy} >
              <Plus className="mr-2 h-4 w-4" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}