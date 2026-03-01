const REQUIRED_ENV_DOC = 'https://supabase.com/dashboard/project/_/settings/api'

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `[Supabase] Variable manquante: ${name}. Ajoute-la dans .env.local puis redémarre le serveur. Voir: ${REQUIRED_ENV_DOC}`
    )
  }

  return value
}

export function getSupabasePublicEnv() {
  return {
    url: assertEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: assertEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }
}

export function getSupabaseServiceRoleKey() {
  return assertEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
}
