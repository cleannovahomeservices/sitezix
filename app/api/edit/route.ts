import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const MODEL_EDIT = 'claude-sonnet-4-6';

const EDIT_SYSTEM = `You are editing an existing single-file HTML website. The user will give you a change request.

RULES:
- Apply EXACTLY what the user asks. Don't redesign anything they didn't mention.
- Keep all existing structure, copy, and styling unless the user asks to change it.
- Preserve the existing primary color, fonts, and layout unless the user asks otherwise.
- Keep Tailwind CDN, Google Fonts, Lucide icons exactly as they are.
- Maintain responsive behavior (don't break mobile/tablet layouts).
- If the user asks for a small change (e.g. "make the hero bigger", "change the title to X"), make ONLY that change.
- If the user asks for a big change (e.g. "redesign as dark mode", "add a pricing section"), do it fully and tastefully — match the existing design language.
- NEVER add Lorem Ipsum or generic placeholder copy. Use real-sounding text in the same language as the existing site.

OUTPUT FORMAT:
Return ONLY the complete updated HTML file. Start with <!DOCTYPE html>. No markdown fences. No explanations.`;

function stripFences(s: string): string {
  return s
    .replace(/^```(?:html|HTML)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
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

  const client = new Anthropic({ apiKey });

  let html = '';
  try {
    const res = await client.messages.create({
      model: MODEL_EDIT,
      max_tokens: 16000,
      system: EDIT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Current HTML:\n\n${project.generated_code}`,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: `Change request: ${message}\n\nReturn the full updated HTML file.`,
            },
          ],
        },
      ],
    });

    const textBlock = res.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Model returned no content' }, { status: 502 });
    }
    html = stripFences(textBlock.text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Edit failed';
    return NextResponse.json({ error: msg }, { status: 500 });
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
