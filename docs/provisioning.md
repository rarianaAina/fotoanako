# Déployer un nouveau client

Compter une heure, dont l'essentiel en attente de propagation DNS.

Chaque client a **son propre projet Supabase et son propre déploiement**.
Aucune donnée n'est partagée entre deux clients : c'est ce qui rend
l'isolation totale sans une ligne de code dédiée.

---

## 1. Créer le projet Supabase

Un projet par client, dans la région la plus proche de son public.
Notez le mot de passe Postgres : il n'est affiché qu'une fois.

## 2. Appliquer le schéma

Dans l'éditeur SQL du dashboard, **dans cet ordre** :

| Fichier | Contenu |
|---|---|
| `supabase/migrations/0001_schema.sql` | Tables, index, déclencheurs d'horodatage |
| `supabase/migrations/0002_rls.sql` | Politiques Row Level Security |
| `supabase/migrations/0003_booking_rpc.sql` | Réservation publique, synchronisation des rappels |
| `supabase/migrations/0004_storage.sql` | Bucket d'images et ses politiques |
| `supabase/seed.sql` | Singletons, moyens de paiement, créneaux |
| `supabase/presets/<métier>.sql` | Vocabulaire, modules et catégories du secteur |

L'ordre compte : `0002` définit `is_admin()`, dont `0003` et `0004` dépendent.

### Choisir le preset

| Preset | Convient à | Modules coupés |
|---|---|---|
| `salon-beaute` | Salon, onglerie, coiffure, spa, institut | aucun |
| `sante` | Kinésithérapie, ostéopathie, podologie | galerie, avis, fidélité |
| `tatouage` | Tatouage, perçage | fidélité |
| `enseignement` | Cours particuliers, école, atelier | galerie, images de référence |
| `reparation` | Garage, informatique, électroménager | galerie, fidélité |

Aucun ne correspond ? Prenez le plus proche : tout se règle ensuite depuis
l'administration, sans SQL.

> **Cabinets de santé** — le preset `sante` coupe la galerie et les avis
> délibérément. Pour plusieurs professions réglementées, la publicité et les
> témoignages de patients sont encadrés. Ne les réactivez qu'après avoir
> vérifié le cadre applicable à la profession du client.

## 3. Créer l'administrateur

Le compte se crée depuis l'application, puis se promeut **une seule fois**
en SQL :

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'client@exemple.fr';
```

La promotion ne peut pas passer par l'application : un déclencheur interdit à
un compte de s'attribuer le rôle `admin`. C'est volontaire — sans cela,
n'importe quel visiteur inscrit deviendrait administrateur.

## 4. Déployer

```bash
cp .env.example .env    # renseigner l'URL et la clé publishable du projet
npm ci && npm run build
```

Sur Vercel : importer le dépôt, définir `VITE_SUPABASE_URL` et
`VITE_SUPABASE_ANON_KEY`, déployer. Le `vercel.json` gère déjà la réécriture
vers `index.html`, nécessaire à une application monopage.

## 5. Configurer, depuis l'administration

Plus aucun SQL à partir d'ici. Dans **Réglages** :

1. **Général** — nom, slogan, description, coordonnées, logo
2. **Devise et région** — devise, symbole, locale, fuseau *(aperçu en direct)*
3. **Couleurs** — la teinte principale se propage à toute l'interface
4. **Vocabulaire** — vérifier les mots du métier
5. **Modules** — activer ou couper les fonctionnalités
6. **Horaires**, **Créneaux**, **Catégories**, **Annulation**
7. **Images de référence** — les photos demandées à la réservation

Puis saisir le catalogue dans **Prestations**.

---

## Vérifier avant de livrer

Le plus important porte sur la sécurité : la clé publishable est publique par
construction, seules les politiques RLS protègent les données.

```bash
U="https://<projet>.supabase.co/rest/v1"
K="<clé publishable>"

# Doit renvoyer une liste vide, jamais des noms de clients
curl -s "$U/clients?select=*" -H "apikey: $K"

# Doit être refusé (42501)
curl -s "$U/services" -H "apikey: $K" -H "Content-Type: application/json" \
     -H "Prefer: return=minimal" -d '{"name":"test","price":1}'
```

Puis, dans un navigateur en navigation privée :

- [ ] la page d'accueil affiche le nom, les couleurs et le logo du client
- [ ] une réservation sans compte aboutit
- [ ] le créneau réservé n'est plus proposé
- [ ] le rendez-vous apparaît dans l'administration
- [ ] les modules coupés sont absents du menu comme de leurs URL directes
- [ ] un téléversement d'image fonctionne côté administration

---

## Repartir de zéro

Sur un projet de mise au point dont on veut effacer l'ardoise :

```
supabase/reset.sql          ← DESTRUCTIF : données, images et comptes
```

puis rejouer les migrations, `seed.sql` et un preset, comme à l'étape 2.

Le script rétablit les droits du schéma `public`. C'est indispensable et
souvent oublié : recréer le schéma efface les droits que Supabase y avait
posés, et sans eux PostgREST ne voit plus aucune table — l'API répond 401
partout alors que les tables existent bel et bien.

## Mettre à jour un client existant

Le code est commun : `git pull` puis redéploiement. Seules les migrations
demandent une attention particulière — appliquez celles qui manquent, dans
l'ordre de leur numéro. Elles sont écrites pour être rejouables sans dégât
(`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`).