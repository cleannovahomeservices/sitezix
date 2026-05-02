import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PreviewClient } from './preview-client';

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, prompt, generated_code, preview_url, status, has_login, has_payments, has_deploy, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) notFound();

  return <PreviewClient project={project} />;
}
