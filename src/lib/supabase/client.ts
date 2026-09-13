import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env?.VITE_SUPABASE_URL ||
    'https://hpnndbmyibbgrlskskyt.supabase.co';

  const supabaseKey =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_1Cio41beIHbD61Vj7AnQMA_6kSM5pI7';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
