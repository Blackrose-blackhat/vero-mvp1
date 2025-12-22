'use server';

import { createSupabaseServerClient } from './supabaseServerClient';


export async function upsertUserAndLogLogin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: userError?.message || 'No user found' };
  }

  // Upsert user info
  const { error: upsertError } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    last_login: new Date().toISOString(),
  });
  if (upsertError) {
    return { error: upsertError.message };
  }

  // Log login event
  const { error: logError } = await supabase.from('logins').insert({
    user_id: user.id,
    login_at: new Date().toISOString(),
  });
  if (logError) {
    return { error: logError.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
