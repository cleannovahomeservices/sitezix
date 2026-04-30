import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { ToastProvider } from '@/components/toast';
import { MeshBg } from '@/components/mesh-bg';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, plan, credits')
    .eq('id', user.id)
    .single();

  // Failsafe: if trigger didn't fire, create the profile via service role
  if (!profile) {
    const admin = createAdminClient();
    await admin.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
    });
    const refetch = await supabase.from('profiles').select('id, email, full_name, avatar_url, plan, credits').eq('id', user.id).single();
    profile = refetch.data;
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar profile={{ full_name: profile?.full_name ?? null, email: profile?.email ?? null, credits: profile?.credits ?? 0, plan: profile?.plan ?? 'free' }} />
        <main className="flex-1 relative overflow-hidden">
          <MeshBg />
          <div className="relative z-10 h-full overflow-y-auto">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
