import { createClient } from '@/lib/supabase/server';
import { ProjectsClient } from './projects-client';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, prompt, preview_url, has_login, has_payments, has_deploy, status, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return <ProjectsClient projects={projects || []} />;
}
