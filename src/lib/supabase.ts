import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Debugging: Log Supabase configuration
console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isLocalhost: supabaseUrl.includes('localhost'),
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
