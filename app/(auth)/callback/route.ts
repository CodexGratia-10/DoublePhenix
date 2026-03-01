import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' | 'signup' | 'email'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password recovery → page de nouveau mot de passe
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/nouveau-mot-de-passe`)
      }
      // Signup / Email confirmation → page login avec message succès
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(`${origin}/login?verified=true`)
      }
      // Default (Google OAuth, etc.) → dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Erreur → retour login avec message
  return NextResponse.redirect(
    `${origin}/login?error=auth_failed`
  )
}