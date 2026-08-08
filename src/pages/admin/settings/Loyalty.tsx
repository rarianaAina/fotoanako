import { useEffect, useState } from 'react';
import { Save, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useLowerLabel } from '@/hooks/useLabels';

export default function LoyaltySettings() {
  const { settings, loading, updateSettings } = useLoyalty();
  const customer = useLowerLabel('customer');

  const [pointsPerVisit, setPointsPerVisit] = useState(10);
  const [rewardThreshold, setRewardThreshold] = useState(500);
  const [rewardLabel, setRewardLabel] = useState('récompense');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPointsPerVisit(settings.pointsPerVisit);
    setRewardThreshold(settings.rewardThreshold);
    setRewardLabel(settings.rewardLabel);
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({ pointsPerVisit, rewardThreshold, rewardLabel });
      toast.success('Programme de fidélité enregistré.');
    } catch {
      toast.error('Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin border-b-2 border-primary" />
      </div>
    );
  }

  const visitsNeeded = pointsPerVisit > 0 ? Math.ceil(rewardThreshold / pointsPerVisit) : null;

  return (
    <div>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Programme de fidélité</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Les points se cumulent à chaque visite. Le comptage est par visite et non
            par montant dépensé : la récompense reste ainsi lisible quelle que soit
            la devise.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="points-per-visit">Points gagnés par visite</Label>
              <Input
                id="points-per-visit"
                type="number"
                min={0}
                step={1}
                value={pointsPerVisit}
                onChange={(e) => setPointsPerVisit(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward-threshold">Points requis pour la récompense</Label>
              <Input
                id="reward-threshold"
                type="number"
                min={1}
                step={10}
                value={rewardThreshold}
                onChange={(e) => setRewardThreshold(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reward-label">Récompense offerte</Label>
              <Input
                id="reward-label"
                value={rewardLabel}
                onChange={(e) => setRewardLabel(e.target.value)}
                placeholder="soin offert, séance offerte, cours offert…"
              />
              <p className="text-xs text-muted-foreground">
                Ce texte s'affiche dans l'espace {customer}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
            <p className="font-medium">Aperçu</p>
            <p className="mt-1 text-muted-foreground">
              {visitsNeeded === null ? (
                <>Aucun point n'est attribué : le programme est inactif.</>
              ) : (
                <>
                  Un {customer} atteint {rewardThreshold} points au bout de{' '}
                  <strong>{visitsNeeded} visite{visitsNeeded > 1 ? 's' : ''}</strong>, et
                  débloque : {rewardLabel}.
                </>
              )}
            </p>
          </div>

          <Separator />
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}