import { createBrowserClient } from '@supabase/ssr'

// These values should be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Use createBrowserClient from @supabase/ssr for better Next.js integration
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey); 