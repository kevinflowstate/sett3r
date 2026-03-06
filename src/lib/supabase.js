import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://abmmlybdqwzujcysagvf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibW1seWJkcXd6dWpjeXNhZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjY5NjQsImV4cCI6MjA4Nzg0Mjk2NH0.MbeElC2xL_JTCkrFMRuOjfxHb5EIOV_FmYm5LB7IZZ4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
