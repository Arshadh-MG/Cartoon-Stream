import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

function createMockSupabase() {
  const noop = async () => ({ data: null, error: null });
  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    eq: () => chain,
    ilike: () => chain,
    order: () => chain,
    single: noop,
    maybeSingle: noop,
    limit: noop,
    then: (resolve) => resolve({ data: null, error: null }),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      signInWithOtp: async () => ({ error: null }),
      signInWithPassword: async () => ({ error: null }),
    },
    from: () => chain,
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

let supabase = null;

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.');
  supabase = createMockSupabase();
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { isSupabaseConfigured, supabase };
