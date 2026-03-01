# PHENIX — Pilier C' (Nexus de Compétences)

Ce dépôt contient l'implémentation MVP du Pilier C':

- Petites annonces académiques interuniversitaires
- Filtrage intelligent par école cible
- Redirection intelligente vers WhatsApp / LinkedIn
- Intégration Supabase (table announcements + RLS)

## Ce que tu as implémenté (résumé)

### 1) Création d'annonce (Pitch)

Un étudiant publie:

- Titre
- Description du besoin
- École ciblée
- Tags
- Préférences de contact (WhatsApp / LinkedIn)

Données stockées dans la table `public.announcements` sur Supabase.

### 2) Matching intelligent (Dashboard)

Quand un étudiant est connecté:

- le backend récupère son `school` depuis `profiles`
- le dashboard affiche uniquement les annonces `target_school = school` ou `target_school = 'All'`

La section affichée côté UI est: **On a besoin de toi**.

### 3) Connexion immédiate

Depuis le détail d'une annonce:

- bouton WhatsApp activé si l'annonce et le profil auteur l'autorisent
- bouton LinkedIn activé si l'annonce et le lien auteur sont disponibles

## Où c'est codé

### Backend API (Next.js Route Handlers)

- `POST /api/announcements` : création annonce
	- `app/api/announcements/route.ts`
- `GET /api/announcements/matching` : matching par école
	- `app/api/announcements/matching/route.ts`

### Intégration frontend -> backend

- Client API annonces: `lib/api/announcements.ts`
- Formulaire de création: `app/(main)/nexus/create/page.tsx`
- Dashboard matching: `app/(main)/dashboard/page.tsx`
- Détail annonce + WhatsApp/LinkedIn: `app/(main)/nexus/[id]/page.tsx`

### Supabase SQL / RLS

- Migration Pilier C':
	- `supabase/migrations/20260301182818_pilier_c_announcements_rls.sql`
- Script SQL équivalent:
	- `supabase/sql/2026-03-01_pilier-c_announcements_rls.sql`

## Démarrage local

1. Installer dépendances

```bash
npm ci
```

2. Créer l'environnement local

```powershell
Copy-Item .env.example .env.local
```

3. Renseigner dans `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Lancer l'app

```bash
npm run dev
```

## Appliquer la migration Supabase

Option CLI:

```bash
npx supabase login
npx supabase link --project-ref dgivtqvnngjdvzqzmbfm
npx supabase db push --linked
```

Si `db push` échoue, exécuter le SQL directement:

```bash
npx supabase db execute --file "supabase/sql/2026-03-01_pilier-c_announcements_rls.sql" --linked
```

## Test fonctionnel rapide

1. Compte A avec `school = IFRI`
2. Compte B publie une annonce `target_school = IFRI`
3. Compte A ouvre dashboard:
	 - voit l'annonce dans **On a besoin de toi**
4. Compte C (autre école) n'accède pas à cette annonce sauf `All`
5. Ouvrir détail annonce et vérifier boutons WhatsApp / LinkedIn

## Notes

- Les endpoints API annonces renvoient `401` si utilisateur non authentifié (comportement attendu).
- Le style frontend n'a pas été refactoré: implémentation centrée sur logique backend + intégration.
