import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import type { CurrencyPosition } from '@/types';

/** Raccourcis courants. La saisie libre reste possible en dessous. */
const CURRENCY_PRESETS = [
  { code: 'EUR', symbol: '€', position: 'suffix' as const, locale: 'fr-FR' },
  { code: 'MGA', symbol: 'Ar', position: 'suffix' as const, locale: 'fr-MG' },
  { code: 'USD', symbol: '$', position: 'prefix' as const, locale: 'en-US' },
  { code: 'XOF', symbol: 'FCFA', position: 'suffix' as const, locale: 'fr-FR' },
  { code: 'MAD', symbol: 'DH', position: 'suffix' as const, locale: 'fr-MA' },
  { code: 'CHF', symbol: 'CHF', position: 'suffix' as const, locale: 'fr-CH' },
];

export default function RegionalSettings() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState({
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    currencyPosition: settings.currencyPosition,
    locale: settings.locale,
    timezone: settings.timezone,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition,
      locale: settings.locale,
      timezone: settings.timezone,
    });
  }, [settings]);

  // Aperçu calculé comme le fait `formatMoney`, pour que l'admin voie
  // immédiatement le rendu réel avant d'enregistrer.
  const preview = (() => {
    try {
      const n = new Intl.NumberFormat(form.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(25000);
      if (!form.currencySymbol) return n;
      return form.currencyPosition === 'prefix'
        ? `${form.currencySymbol} ${n}`
        : `${n} ${form.currencySymbol}`;
    } catch {
      return 'Locale invalide';
    }
  })();

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success('Paramètres régionaux enregistrés.');
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
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Devise et région</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {CURRENCY_PRESETS.map((c) => (
              <Button
                key={c.code}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    currencyCode: c.code,
                    currencySymbol: c.symbol,
                    currencyPosition: c.position,
                    locale: c.locale,
                  }))
                }
              >
                {c.code} · {c.symbol}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currencyCode">Code devise</Label>
              <Input
                id="currencyCode"
                value={form.currencyCode}
                onChange={(e) => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })}
                placeholder="EUR"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currencySymbol">Symbole affiché</Label>
              <Input
                id="currencySymbol"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                placeholder="€"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position du symbole</Label>
              <Select
                value={form.currencyPosition}
                onValueChange={(v) =>
                  setForm({ ...form, currencyPosition: v as CurrencyPosition })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suffix">Après le montant — 25 000 €</SelectItem>
                  <SelectItem value="prefix">Avant le montant — $ 25 000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locale">Locale</Label>
              <Input
                id="locale"
                value={form.locale}
                onChange={(e) => setForm({ ...form, locale: e.target.value })}
                placeholder="fr-FR"
              />
              <p className="text-xs text-muted-foreground">
                Détermine la séparation des milliers et le format des dates.
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Input
                id="timezone"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                placeholder="Europe/Paris"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Aperçu</p>
            <p className="mt-1 font-display text-2xl text-primary">{preview}</p>
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