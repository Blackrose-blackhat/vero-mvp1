// This file initializes the Supabase client for use in the app
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
