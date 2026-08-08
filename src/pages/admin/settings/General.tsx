import { useEffect, useState, useRef } from 'react';
import { Save, Upload, Store, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { uploadImage } from '@/services/storageService';
import type { BusinessSettings } from '@/types';

/**
 * Champs pilotés par cet écran. Énumérés explicitement plutôt que dérivés par
 * exclusion : les réglages de couleurs, d'horaires, de réseaux sociaux, de
 * modules et de vocabulaire ont chacun leur propre page, et un `...rest`
 * finirait par les écraser au premier champ ajouté au modèle.
 */
type GeneralInfo = Pick<
  BusinessSettings,
  'name' | 'tagline' | 'description' | 'address' | 'phone' | 'whatsapp' | 'email' | 'website'
>;

const EMPTY_INFO: GeneralInfo = {
  name: '',
  tagline: '',
  description: '',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
};

export default function GeneralSettings() {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState<GeneralInfo>(EMPTY_INFO);
  // Aucun logo par défaut : chaque déploiement fournit le sien, et l'initiale
  // du nom sert de repli.
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setInfo({
      name: settings.name,
      tagline: settings.tagline,
      description: settings.description,
      address: settings.address,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      website: settings.website ?? '',
    });
    setLogoUrl(settings.logoUrl ?? null);
  }, [settings]);

  const save = async () => {
    await updateSettings({ ...info, logoUrl: logoUrl ?? undefined });
    toast.success('Paramètres enregistrés.');
  };

  // ✅ Gestion de l'upload du logo avec compression automatique et renommage
  const handleLogoUpload = async (file: File) => {
    // Vérifier la taille (max 2 Mo)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 2 Mo)');
      return;
    }

    // Vérifier le type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Format non supporté (JPG, PNG, WebP, SVG)');
      return;
    }

    setUploading(true);
    try {
      // ✅ Renommer le fichier en "logo.webp" avant upload
      const renamedFile = new File(
        [file],
        'logo.webp',
        { type: 'image/webp' }
      );
      
      // ✅ Upload avec nom fixe "logo"
      const url = await uploadImage(renamedFile, 'logos', 'logo');
      setLogoUrl(url);
      toast.success('Logo téléversé avec succès !');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléversement du logo');
    } finally {
      setUploading(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ✅ Aperçu avant upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Uploader automatiquement
    handleLogoUpload(file);
  };

  // ✅ Supprimer le logo (retour au défaut)
  const handleRemoveLogo = async () => {
    setLogoUrl(null);
    toast.success('Logo supprimé.');
  };

  return (
    <div>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Informations de l’entreprise</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de l’entreprise</Label>
            <Input id="name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Slogan</Label>
            <Input id="tagline" value={info.tagline} onChange={(e) => setInfo({ ...info, tagline: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea id="address" rows={2} value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
          </div>
          
          {/* ✅ Upload du logo */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Logo</Label>
            <div className="flex flex-wrap items-center gap-4">
              {/* Aperçu du logo */}
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border/60 bg-secondary/30">
                {(previewUrl || logoUrl) ? (
                  <img
                    src={previewUrl ?? logoUrl ?? undefined}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">
                    {info.name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {logoUrl && !previewUrl && (
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -right-1 -top-1 bg-destructive p-0.5 text-destructive-foreground hover:bg-destructive/90"
                    title="Supprimer le logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Téléversement...' : 'Téléverser un logo'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP ou SVG. Max 2 Mo. Format carré recommandé.
                </p>
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent" />
                    Compression en cours...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={save} disabled={uploading}>
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}