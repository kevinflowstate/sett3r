import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://abmmlybdqwzujcysagvf.supabase.co'
const supabaseAnonKey = 'sb_publishable_ws2Z4KAp4HnswpDEc1HZ-w_sxoOn2mO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
