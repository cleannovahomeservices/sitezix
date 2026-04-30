import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url, plan, credits')
    .eq('id', user!.id)
    .single();

  return <SettingsClient
    initialName={profile?.full_name || ''}
    email={profile?.email || user?.email || ''}
    avatarUrl={profile?.avatar_url || null}
    plan={profile?.plan || 'free'}
    credits={profile?.credits ?? 0}
  />;
}
