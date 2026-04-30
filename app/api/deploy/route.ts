import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await request.json().catch(() => ({}));
  if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });

  const admin = createAdminClient();
  const { data: project } = await admin
    .from('projects')
    .select('id, name, generated_code, user_id')
    .eq('id', projectId)
    .single();

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  if (!project.generated_code) {
    return NextResponse.json({ error: 'Project has no generated code' }, { status: 400 });
  }

  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Vercel token not configured' }, { status: 500 });
  }

  // Build deployment payload — Vercel API takes inline files
  const slug = (project.name || 'sitezix-app').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'sitezix-app';
  const projectName = `${slug}-${project.id.slice(0, 6)}`;

  const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      target: 'production',
      files: [
        { file: 'index.html', data: project.generated_code },
      ],
      projectSettings: { framework: null },
    }),
  });

  const deployJson = await deployRes.json();
  if (!deployRes.ok) {
    return NextResponse.json({ error: deployJson.error?.message || 'Deploy failed' }, { status: 502 });
  }

  const url = deployJson.url ? `https://${deployJson.url}` : null;
  if (url) {
    await admin.from('projects').update({ preview_url: url, status: 'live' }).eq('id', projectId);
  }

  return NextResponse.json({ url, deploymentId: deployJson.id });
}
