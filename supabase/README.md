# Supabase setup (Pilier C')

Guide pratique pour activer les règles SQL/RLS du Nexus de Compétences.

## Fichier SQL à exécuter

- [supabase/sql/2026-03-01_pilier-c_announcements_rls.sql](sql/2026-03-01_pilier-c_announcements_rls.sql)

## Option A — Via Supabase Dashboard (recommandé)

1. Ouvre le lien direct du projet:
  - `https://supabase.com/dashboard/project/pshayqppnofadhzzfrxn`
2. Va dans `SQL Editor` > `New query`.
3. Copie/colle le contenu du fichier SQL ci-dessus.
4. Clique `Run`.

### Si tu ne vois pas le Dashboard

1. Déconnecte-toi puis reconnecte-toi à `https://supabase.com/dashboard`.
2. Vérifie que tu es connecté avec le bon compte (email/GitHub).
3. Vérifie l'organisation active (sélecteur en haut à gauche).
4. Si le projet est introuvable, demande une invitation au projet.

## Option B — Via CLI (sans Dashboard)

Depuis le dossier racine du projet:

1. Installer la CLI (si besoin):
  - `npm i -g supabase`
2. Login:
  - `supabase login`
3. Lier le projet:
  - `supabase link --project-ref pshayqppnofadhzzfrxn`
4. Exécuter le SQL:
  - `supabase db execute --file "supabase/sql/2026-03-01_pilier-c_announcements_rls.sql" --linked`

## Ce que le script applique

- Normalisation de `announcements.target_school` (`null`/vide -> `All`)
- Contrainte `target_school` non vide + `NOT NULL`
- Index pour `target_school`, `collab_type`, `user_id`, `tags`
- Politiques RLS:
  - lecture ciblée: `target_school = école du profil` ou `target_school = 'All'`
  - insertion: utilisateur authentifié sur ses propres lignes
  - update/delete: auteur de l'annonce ou admin

## Vérification SQL après exécution

Exécute ces requêtes:

```sql
select relrowsecurity
from pg_class
where oid = 'public.announcements'::regclass;
```

```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'announcements'
order by policyname;
```

Résultat attendu:

- `relrowsecurity = true`
- policies présentes:
  - `announcements_select_targeted`
  - `announcements_insert_owner`
  - `announcements_update_owner_or_admin`
  - `announcements_delete_owner_or_admin`

## Vérification fonctionnelle dans l'app

1. Connecte-toi avec un profil ayant `school = 'IFRI'`.
2. Crée une annonce ciblée `FSS` et une annonce `All`.
3. Va sur le dashboard:
  - la section **On a besoin de toi** montre `All` + `IFRI`
  - elle ne montre pas `FSS` (sauf auteur/admin)
