import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User as UserIcon,
  Phone, ArrowRight, Eye, EyeOff, ShieldCheck, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/user';
import BrandLogo from '@/components/BrandLogo';
import { useSettings } from '@/hooks/useSettings';
import { useLabels } from '@/hooks/useLabels';

type Mode = 'login' | 'register';


export default function Auth() {
  const { settings } = useSettings();
  const t = useLabels();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('client');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const set = (k: keyof typeof form, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(form.email, form.password, role);
        toast.success(`Bienvenue, ${u.name.split(' ')[0]} !`);
        navigate(u.role === 'admin' ? '/admin' : '/mon-espace');
      } else {
        // ✅ En inscription, le rôle est toujours 'client'
        const u = await register({ ...form, role: 'client' });
        toast.success(`Compte créé. Bienvenue, ${u.name.split(' ')[0]} !`);
        navigate('/mon-espace');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30" />
        
        {/* ✅ Logo et nom cliquables vers l'accueil */}
        <Link to="/" className="relative flex items-center gap-3 hover:opacity-80 transition-opacity">
          <BrandLogo size={12} />
          <div>
            <p className="text-xl font-semibold">{settings.name}</p>
          </div>
        </Link>
        
        <div className="relative">
          <h1
            className="text-5xl font-semibold leading-tight text-foreground">
            {settings.name}<span className="block italic text-primary">{settings.tagline}</span>
          </h1>
          <p
            className="mt-5 max-w-md text-foreground/70">
            Connectez-vous pour réserver vos rendez-vous, suivre votre historique et profiter d'offres exclusives.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} {settings.name}</div>
      </div>

      {/* Right form */}
      <div className="relative flex items-center justify-center overflow-y-auto bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-[0.15] lg:hidden" />
        <div className="relative w-full max-w-md">
          {/* ✅ Logo et nom cliquables vers l'accueil (version mobile) */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-3 hover:opacity-80 transition-opacity lg:hidden">
            <BrandLogo size={12} />
            <div>
              <p className="text-xl font-semibold">{settings.name}</p>
            </div>
          </Link>

          <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
            <div className="relative mb-6 grid grid-cols-2 bg-secondary p-1 text-sm font-medium">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn('relative z-10  py-2 transition-colors', mode === m ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  {m === 'login' ? 'Connexion' : 'Inscription'}
                  {mode === m && (
                    <span className="absolute inset-0 -z-10 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div key={mode}>
                <h2 className="text-2xl font-semibold">{mode === 'login' ? 'Bon retour parmi nous' : 'Créez votre compte'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{mode === 'login' ? 'Connectez-vous pour accéder à votre espace.' : `Rejoignez ${settings.name} pour réserver en ligne.`}</p>

                {/* ✅ Sélecteur de rôle : affiché uniquement en mode connexion */}
                {mode === 'login' && (
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {([{ v: 'client', label: t('customer'), icon: Heart }, { v: 'admin', label: 'Administrateur', icon: ShieldCheck }] as { v: UserRole; label: string; icon: typeof Heart }[]).map((r) => (
                      <button key={r.v} type="button" onClick={() => setRole(r.v)}
                        className={cn('flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all',
                          role === r.v ? 'border-primary bg-primary/5 text-primary ' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground')}>
                        <r.icon className="h-4 w-4" /> {r.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ✅ En inscription, on indique que le compte sera client */}
                {mode === 'register' && (
                  <div className="mt-4 rounded-xl bg-secondary/50 p-3 text-center text-sm text-muted-foreground">
                    <Heart className="inline h-4 w-4 text-primary mr-1.5" />
                    Vous créez un compte <span className="font-medium text-foreground">{t('customer').toLowerCase()}</span>
                  </div>
                )}

                <form onSubmit={submit} className="mt-5 space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Votre nom" className="pl-9" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@email.com" className="pl-9" />
                    </div>
                  </div>
                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="phone" required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+33 ..." className="pl-9" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" className="pl-9 pr-10" />
                      <button type="button" onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={showPw ? 'Masquer' : 'Afficher'}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <Link
                      to="/mot-de-passe-oublie"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "Créer mon compte"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}