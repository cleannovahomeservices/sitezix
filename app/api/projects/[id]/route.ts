import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { deleteVercelProject, projectSlug } from '@/lib/vercel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // If it was deployed, kill the Vercel project too. Don't fail if Vercel says 404.
  let vercelDeleted = false;
  if (project.preview_url) {
    const slug = projectSlug(project.name, project.id);
    const vercelRes = await deleteVercelProject(slug);
    vercelDeleted = vercelRes.ok;
  }

  // Delete chat history first (in case ON DELETE CASCADE isn't set)
  await admin.from('chat_history').delete().eq('project_id', id);
  const { error: delErr } = await admin.from('projects').delete().eq('id', id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, vercelDeleted });
}
