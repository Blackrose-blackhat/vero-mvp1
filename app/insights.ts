'use server';

import { createSupabaseServerClient } from './supabaseServerClient';

export async function getLoginInsights() {
  const supabase = await createSupabaseServerClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Today's logins
  const { data: todayLogins, error: todayError } = await supabase
    .from('logins')
    .select('user_id', { count: 'exact', head: true })
    .gte('login_at', today.toISOString())
    .lt('login_at', tomorrow.toISOString());

  // Unique visitors today
  const { data: uniqueToday, error: uniqueError } = await supabase
    .from('logins')
    .select('user_id', { count: 'exact', head: true })
    .gte('login_at', today.toISOString())
    .lt('login_at', tomorrow.toISOString())
    .neq('user_id', null);

  if (todayError || uniqueError) {
    return { error: todayError?.message || uniqueError?.message };
  }

  return {
    todayLogins: todayLogins?.length || 0,
    uniqueVisitors: uniqueToday?.length || 0,
  };
}
