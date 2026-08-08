import { useState } from 'react';
import { Phone, MessageCircle, Facebook, Instagram, MapPin, Clock, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import PageHeader from '@/components/public/PageHeader';

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message envoyé ! Nous vous répondrons rapidement.');
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Contact"
        title="Nous joindre"
        lead="Une question, une demande particulière ? Écrivez ou appelez."
      />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              {settings && (
                <>
                  <Card className="border-border/60">
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-semibold">Coordonnées</h3>
                      <div className="mt-5 space-y-4">
                        <a href={`tel:${settings.phone}`} className="flex items-center gap-4 transition-colors hover:text-primary">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
                          <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="font-medium">{settings.phone}</p></div>
                        </a>
                        <a href={`https://wa.me/${settings.whatsapp.replace(/\s/g, '')}`} className="flex items-center gap-4 transition-colors hover:text-primary">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><MessageCircle className="h-5 w-5" /></span>
                          <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="font-medium">{settings.whatsapp}</p></div>
                        </a>
                        <a href={`mailto:${settings.email}`} className="flex items-center gap-4 transition-colors hover:text-primary">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
                          <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{settings.email}</p></div>
                        </a>
                        <div className="flex items-center gap-4">
                          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></span>
                          <div><p className="text-xs text-muted-foreground">Adresse</p><p className="font-medium">{settings.address}</p></div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <a href={settings.facebook} className="grid h-10 w-10 place-items-center bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Facebook">
                          <Facebook className="h-4 w-4" />
                        </a>
                        <a href={settings.instagram} className="grid h-10 w-10 place-items-center bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Instagram">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="text-2xl font-semibold">Horaires</h3>
                      </div>
                      <div className="mt-4 divide-y divide-border/60">
                        {settings.hours.map((h) => (
                          <div key={h.day} className="flex items-center justify-between py-2.5 text-sm">
                            <span className="font-medium">{h.day}</span>
                            <span className={h.closed ? 'text-destructive' : 'text-muted-foreground'}>
                              {h.closed ? 'Fermé' : `${h.open} — ${h.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

            </div>

            <div >
              <Card className="border-border/60">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-2xl font-semibold">Envoyez-nous un message</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Réponse sous 24h ouvrées.</p>
                  <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vous@email.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+33 ..." />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Votre message..." />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" /> Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
