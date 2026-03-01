// Client admin - contourne le RLS 
// Uniquement dans les routes API backend 

import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from './env'

const { url } = getSupabasePublicEnv()
const serviceRoleKey = getSupabaseServiceRoleKey()

export const supabaseAdmin = createClient(
    url,
    serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false, persistSession: false
        }
    }
)
