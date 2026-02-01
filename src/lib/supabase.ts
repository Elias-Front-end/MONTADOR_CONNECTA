import { createClient } from '@supabase/supabase-js';

// Prioritize Runtime Config (window.__ENV__) over Build-time Config (import.meta.env)
const getEnv = (key: keyof Window['__ENV__']) => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  return import.meta.env[key];
};

// Check if we should use the internal proxy
// This flag comes from the server injection as well
const useProxy = (typeof window !== 'undefined' && window.__ENV__ && (window.__ENV__ as any).USE_PROXY === 'true');

let supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'http://localhost:8000';

// If proxy is enabled, point Supabase Client to our own backend route
if (useProxy) {
  // Use current origin + /api/supabase
  supabaseUrl = `${window.location.origin}/api/supabase`;
  console.log('Using Internal Proxy for Supabase:', supabaseUrl);
}

const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'placeholder';

// Debugging: Log Supabase configuration
console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isLocalhost: supabaseUrl?.includes('localhost'),
  source: typeof window !== 'undefined' && window.__ENV__?.VITE_SUPABASE_URL ? 'runtime' : 'build-time'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
