import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const MODEL_EDIT = 'anthropic/claude-sonnet-4.5';

const EDIT_PROMPT = `You are editing an existing website. The user wants to modify it. Return the complete updated HTML file with the requested changes applied. Keep everything else exactly the same. Preserve Tailwind CDN, Google Fonts, Lucide icons, and the existing primary color unless the user asks to change it. Return ONLY the HTML file starting with <!DOCTYPE html>. No explanations, no markdown fences.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, message } = await request.json().catch(() => ({}));
  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single();
  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 });
  }

  const { data: project } = await admin
    .from('projects')
    .select('id, user_id, generated_code')
    .eq('id', projectId)
    .single();
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  if (!project.generated_code) {
    return NextResponse.json({ error: 'Project has no generated code yet' }, { status: 400 });
  }

  await admin.from('chat_history').insert({
    user_id: user.id,
    project_id: projectId,
    role: 'user',
    content: message,
  });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_REPLACE_ME') {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 });
  }

  const userPayload = `User edit request:\n${message}\n\nCurrent HTML:\n${project.generated_code}`;

  let html = '';
  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sitezix.vercel.app',
        'X-Title': 'Sitezix',
      },
      body: JSON.stringify({
        model: MODEL_EDIT,
        messages: [
          { role: 'system', content: EDIT_PROMPT },
          { role: 'user', content: userPayload },
        ],
        max_tokens: 12000,
      }),
    });
    const json = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json({ error: json?.error?.message || 'OpenRouter error' }, { status: 502 });
    }
    html = (json?.choices?.[0]?.message?.content || '')
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Edit failed' }, { status: 500 });
  }

  if (!html || !/<!DOCTYPE html>/i.test(html)) {
    return NextResponse.json({ error: 'Model returned invalid HTML' }, { status: 502 });
  }

  await admin.from('chat_history').insert({
    user_id: user.id,
    project_id: projectId,
    role: 'assistant',
    content: 'Updated the website with your changes.',
  });

  await admin
    .from('projects')
    .update({ generated_code: html })
    .eq('id', projectId);

  await admin.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

  return NextResponse.json({ html });
}
