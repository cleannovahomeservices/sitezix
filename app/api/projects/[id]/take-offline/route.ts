import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { deleteVercelProject, projectSlug } from '@/lib/vercel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: project } = await admin
    .from('projects')
    .select('id, name, user_id, preview_url')
    .eq('id', id)
    .single();

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!project.preview_url) {
    return NextResponse.json({ error: 'Project is not live' }, { status: 400 });
  }

  const slug = projectSlug(project.name, project.id);
  const vercelRes = await deleteVercelProject(slug);

  await admin
    .from('projects')
    .update({ preview_url: null, status: 'draft' })
    .eq('id', id);

  return NextResponse.json({ ok: true, vercelStatus: vercelRes.status });
}
