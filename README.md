# Fotoanako

Socle applicatif **white-label** pour toute entreprise de services sur rendez-vous :
salon, barbier, spa, tatoueur, kinésithérapeute, cours particuliers, atelier de
réparation…

Un déploiement par client. Ce qui change d'un client à l'autre — identité, couleurs,
devise, vocabulaire, fonctionnalités actives — vit **en base de données**, pas dans
le code. Le code, lui, est le même partout.

## Ce que fait le produit

**Côté public** — vitrine, catalogue de prestations, prise de rendez-vous en ligne
(avec ou sans compte), consultation des disponibilités, galerie de réalisations,
avis clients, page contact.

**Côté administration** — tableau de bord, agenda, gestion des rendez-vous, fichier
clients, catalogue, galerie, statistiques, rappels, et un panneau de réglages
complet (identité, horaires, couleurs, catégories, créneaux, moyens de paiement,
fidélité, règles d'annulation).

**Côté client connecté** — espace personnel avec historique et points de fidélité.

## Pile technique

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui (Radix) · React Router 7 ·
Supabase (PostgreSQL, Auth, Storage) · déploiement Vercel.

Aucun serveur applicatif à maintenir : le client parle directement à Supabase, et
la sécurité repose sur les politiques Row Level Security.

## Démarrage

```bash
npm ci
cp .env.example .env      # puis renseigner les valeurs du projet Supabase
npm run dev
```

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualisation du build |
| `npm run typecheck` | Vérification TypeScript sans émission |
| `npm run lint` | ESLint |
| `./scripts/validate-sql.sh` | Rejoue tout le SQL sur une base jetable et teste la réservation |

## Base de données

Le schéma est **versionné dans ce dépôt** — c'est ce qui rend le produit
redéployable. À appliquer dans l'ordre sur un projet Supabase vierge :

```
supabase/migrations/0001_schema.sql   -- tables, index, déclencheurs
supabase/migrations/0002_rls.sql      -- politiques Row Level Security
supabase/seed.sql                     -- données initiales selon le preset métier
supabase/presets/<métier>.sql         -- vocabulaire, modules et catégories
```

Pour repartir de zéro sur un projet de mise au point : `supabase/reset.sql`,
puis rejouer la séquence ci-dessus. Le script est destructif — il efface
données, images et comptes.

### Note de sécurité

La clé `VITE_SUPABASE_ANON_KEY` est embarquée dans le bundle JavaScript : elle est
publique par construction. **Toute la confidentialité repose sur les politiques
RLS.** Celles-ci partent du refus et n'ouvrent que le nécessaire :

- lecture publique limitée aux contenus de vitrine (catalogue actif, galerie,
  avis validés, horaires) ;
- les données personnelles (`clients`, `appointments`, `users`) ne sont jamais
  lisibles anonymement ;
- l'écriture est réservée aux administrateurs, à deux exceptions près : la création
  d'un rendez-vous et le dépôt d'un avis, tous deux verrouillés par déclencheur ;
- l'escalade de privilège vers `role = 'admin'` est bloquée en base.

Ne jamais placer de secret dans `business_settings` : cette table est lisible par
tout le monde.

## Configuration d'un nouveau client

Voir [`docs/provisioning.md`](docs/provisioning.md).

En résumé : créer un projet Supabase, appliquer les trois fichiers SQL avec le
preset métier voulu, renseigner `.env`, déployer. Le reste se règle depuis le
panneau d'administration.