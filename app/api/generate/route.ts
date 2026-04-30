import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert web developer. Generate a complete, beautiful, single HTML file for the following website. Include all CSS and JavaScript inline. Make it modern, responsive, and professional. Use Tailwind via CDN script tag. Return ONLY the raw HTML code, with no markdown fences, no explanation, no preamble.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, features } = await request.json().catch(() => ({}));
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check credits
  const { data: profile } = await admin
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single();
  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 });
  }

  // Save user message
  await admin.from('chat_history').insert({
    user_id: user.id,
    role: 'user',
    content: prompt,
  });

  // Compose user prompt
  const featureNote = features
    ? Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ')
    : '';
  const userMessage = featureNote
    ? `${prompt}\n\nInclude these features: ${featureNote}.`
    : prompt;

  // Call OpenRouter
  const apiKey = process.env.OPENROUTER_API_KEY;
  let html = '';

  if (!apiKey || apiKey === 'PLACEHOLDER_REPLACE_ME') {
    // Fallback demo HTML when no API key set
    html = renderDemoFallback(prompt);
  } else {
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
          model: 'anthropic/claude-haiku',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 8000,
        }),
      });
      const json = await upstream.json();
      if (!upstream.ok) {
        return NextResponse.json({ error: json.error?.message || 'OpenRouter error' }, { status: 502 });
      }
      html = json.choices?.[0]?.message?.content || '';
      // Strip markdown fences if any
      html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed' }, { status: 500 });
    }
  }

  // Save assistant message
  await admin.from('chat_history').insert({
    user_id: user.id,
    role: 'assistant',
    content: html.slice(0, 50000),
  });

  // Save project
  const projectName = prompt.split(/\s+/).slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 60) || 'Untitled';

  const { data: project, error: projErr } = await admin
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectName,
      prompt,
      generated_code: html,
      has_login: !!features?.login,
      has_payments: !!features?.payments,
      has_deploy: !!features?.deploy,
      status: 'draft',
    })
    .select('id')
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: projErr?.message || 'Failed to save project' }, { status: 500 });
  }

  // Deduct credit
  await admin.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

  return NextResponse.json({ projectId: project.id, html });
}

function renderDemoFallback(prompt: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Preview</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-950 via-black to-blue-950 min-h-screen flex items-center justify-center text-white font-sans">
  <div class="max-w-2xl px-6 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
      OpenRouter API key missing
    </div>
    <h1 class="text-5xl font-bold mb-4 leading-tight">Add your OpenRouter key to generate sites</h1>
    <p class="text-white/60 text-lg mb-8">Set the <code class="bg-white/10 px-2 py-0.5 rounded">OPENROUTER_API_KEY</code> env var in Vercel and redeploy. Until then, this is the placeholder preview for your prompt:</p>
    <blockquote class="text-left bg-white/5 border border-white/10 rounded-xl p-5 text-white/80 italic">
      "${prompt.replace(/"/g, '&quot;').replace(/</g, '&lt;')}"
    </blockquote>
  </div>
</body></html>`;
}
