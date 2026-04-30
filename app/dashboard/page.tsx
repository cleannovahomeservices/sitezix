import { createClient } from '@/lib/supabase/server';
import { HomeClient } from './home-client';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, credits')
    .eq('id', user!.id)
    .single();

  return <HomeClient userName={profile?.full_name || user?.email?.split('@')[0] || 'there'} credits={profile?.credits ?? 0} />;
}
