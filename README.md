# PHENIX

Plateforme Next.js + Supabase (Auth, PostgreSQL, Storage, IA/RAG).

## Démarrage local

1. Installer les dépendances:

```bash
npm ci
```

2. Créer le fichier d'environnement:

```bash
cp .env.example .env.local
```

Sur Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Renseigner les clés Supabase dans `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Ces valeurs sont disponibles dans Supabase Dashboard > Project Settings > API.

4. Lancer l'app:

```bash
npm run dev
```

## Erreur fréquente Supabase

Si tu vois:

`@supabase/ssr: Your project's URL and API key are required...`

alors `.env.local` est absent ou incomplet. Remplis les 3 variables ci-dessus puis redémarre le serveur.

## Stack du projet

- Frontend: Next.js App Router + Tailwind
- Backend: Supabase (PostgreSQL, Auth, Storage)
- IA: Groq + embeddings + indexation de documents
