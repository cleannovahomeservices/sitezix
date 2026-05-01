import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const MODEL_ANALYZE = 'meta-llama/llama-4-scout:free';
const MODEL_STRUCTURE = 'google/gemini-2.0-flash-exp:free';
const MODEL_POLISH = 'anthropic/claude-sonnet-4.5';

const ANALYZE_PROMPT = `You analyze a website-build request and extract structured planning data.
Return ONLY valid minified JSON, no prose, no markdown fences. Schema:
{
  "businessType": string,
  "targetAudience": string,
  "primaryColor": string,            // single hex like "#6d28d9"
  "sections": string[],               // e.g. ["hero","features","pricing","testimonials","footer"]
  "tone": string,                     // "professional" | "friendly" | "luxury" | "playful" | "minimal"
  "imageKeywords": string[],          // 3-6 single words for Unsplash
  "fontFamily": string                // Google Font name that matches the brand, e.g. "Inter"
}`;

const STRUCTURE_PROMPT = `You write semantic HTML5 only. No styling, no inline CSS, no Tailwind classes.
Use semantic tags (header, nav, main, section, article, footer) and clear class names.
Include all sections from the plan. Use real-sounding placeholder copy (no Lorem Ipsum).
For images use <img src="UNSPLASH:{keyword}" alt="..."> — these will be replaced later.
Return ONLY the complete HTML body content (no <html> or <head>), no markdown fences, no explanations.`;

const POLISH_PROMPT = `You are an elite UI/UX designer and developer.
Take this HTML structure and make it visually stunning.

STRICT RULES:
- Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
- Google Fonts: use the font from the analysis (load via <link>)
- Images: replace UNSPLASH:{keyword} placeholders with https://source.unsplash.com/800x600/?{keyword}
- Icons: Lucide via CDN (https://unpkg.com/lucide@latest) with lucide.createIcons() on load
- ONE primary color (from analysis), used only for: CTAs, active states, accents
- Background: white or #f9fafb
- Cards: white, shadow-sm, rounded-xl, border border-gray-100
- NO bright gradients except subtle one in hero only
- Whitespace: minimum 96px between sections (py-24 lg:py-28)
- Typography:
  Hero: 64px bold (text-6xl font-bold)
  H2: 40px semibold (text-4xl font-semibold)
  Body: 16px text-gray-600 leading-relaxed
- Navbar: white sticky (sticky top-0), border-b border-gray-100
- Footer: #111 dark, white text
- Smooth transitions on all hover states (transition-colors, transition-transform)
- Fully responsive mobile-first
- Quality must match Stripe.com or Linear.app

Return ONLY the complete HTML file. Start with <!DOCTYPE html>. No explanations, no markdown fences.`;

type AnalysisJson = {
  businessType: string;
  targetAudience: string;
  primaryColor: string;
  sections: string[];
  tone: string;
  imageKeywords: string[];
  fontFamily: string;
};

const FALLBACK_ANALYSIS: AnalysisJson = {
  businessType: 'general',
  targetAudience: 'general public',
  primaryColor: '#6d28d9',
  sections: ['hero', 'features', 'testimonials', 'cta', 'footer'],
  tone: 'professional',
  imageKeywords: ['business', 'team', 'office', 'modern'],
  fontFamily: 'Inter',
};

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8000,
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sitezix.vercel.app',
      'X-Title': 'Sitezix',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `OpenRouter error (${model})`);
  }
  const content = json?.choices?.[0]?.message?.content || '';
  return content;
}

function stripFences(s: string): string {
  return s.replace(/^```(?:html|json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function parseAnalysis(raw: string): AnalysisJson {
  const cleaned = stripFences(raw);
  try {
    const parsed = JSON.parse(cleaned);
    return {
      businessType: parsed.businessType || FALLBACK_ANALYSIS.businessType,
      targetAudience: parsed.targetAudience || FALLBACK_ANALYSIS.targetAudience,
      primaryColor: parsed.primaryColor || FALLBACK_ANALYSIS.primaryColor,
      sections: Array.isArray(parsed.sections) && parsed.sections.length ? parsed.sections : FALLBACK_ANALYSIS.sections,
      tone: parsed.tone || FALLBACK_ANALYSIS.tone,
      imageKeywords: Array.isArray(parsed.imageKeywords) && parsed.imageKeywords.length ? parsed.imageKeywords : FALLBACK_ANALYSIS.imageKeywords,
      fontFamily: parsed.fontFamily || FALLBACK_ANALYSIS.fontFamily,
    };
  } catch {
    // Try to extract first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return { ...FALLBACK_ANALYSIS, ...parsed };
      } catch {
        // fall through
      }
    }
    return FALLBACK_ANALYSIS;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, features } = await request.json().catch(() => ({}));
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single();
  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const featureNote = features
    ? Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ')
    : '';
  const userMessage = featureNote ? `${prompt}\n\nInclude these features: ${featureNote}.` : prompt;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        await admin.from('chat_history').insert({
          user_id: user.id,
          role: 'user',
          content: prompt,
        });

        let html = '';

        if (!apiKey || apiKey === 'PLACEHOLDER_REPLACE_ME') {
          send({ type: 'progress', step: 1, message: 'Analyzing your request...' });
          await new Promise((r) => setTimeout(r, 400));
          send({ type: 'progress', step: 2, message: 'Building structure...' });
          await new Promise((r) => setTimeout(r, 400));
          send({ type: 'progress', step: 3, message: 'Designing & polishing...' });
          await new Promise((r) => setTimeout(r, 400));
          html = renderDemoFallback(prompt);
        } else {
          // ── Step 1: analyze ─────────────────────────────────────────
          send({ type: 'progress', step: 1, message: 'Analyzing your request...' });
          let analysis: AnalysisJson;
          try {
            const raw = await callOpenRouter(apiKey, MODEL_ANALYZE, ANALYZE_PROMPT, userMessage, 800);
            analysis = parseAnalysis(raw);
          } catch {
            analysis = FALLBACK_ANALYSIS;
          }

          // ── Step 2: structure ───────────────────────────────────────
          send({ type: 'progress', step: 2, message: 'Building structure...' });
          const structureUserMsg = `User request: ${userMessage}\n\nPlan (JSON):\n${JSON.stringify(analysis)}\n\nWrite the semantic HTML body now.`;
          let structureHtml = '';
          try {
            structureHtml = stripFences(await callOpenRouter(apiKey, MODEL_STRUCTURE, STRUCTURE_PROMPT, structureUserMsg, 4000));
          } catch (e) {
            send({ type: 'error', error: `Structure step failed: ${e instanceof Error ? e.message : 'unknown'}` });
            controller.close();
            return;
          }

          // ── Step 3: polish ──────────────────────────────────────────
          send({ type: 'progress', step: 3, message: 'Designing & polishing...' });
          const polishUserMsg = `Plan (JSON):\n${JSON.stringify(analysis)}\n\nSemantic HTML structure to style:\n${structureHtml}`;
          try {
            html = stripFences(await callOpenRouter(apiKey, MODEL_POLISH, POLISH_PROMPT, polishUserMsg, 12000));
          } catch (e) {
            send({ type: 'error', error: `Polish step failed: ${e instanceof Error ? e.message : 'unknown'}` });
            controller.close();
            return;
          }

          send({ type: 'progress', step: 4, message: 'Almost ready...' });
        }

        await admin.from('chat_history').insert({
          user_id: user.id,
          role: 'assistant',
          content: html.slice(0, 50000),
        });

        const projectName =
          prompt.split(/\s+/).slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 60) ||
          'Untitled';

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
          send({ type: 'error', error: projErr?.message || 'Failed to save project' });
          controller.close();
          return;
        }

        await admin.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

        send({ type: 'complete', projectId: project.id, html });
      } catch (e) {
        send({ type: 'error', error: e instanceof Error ? e.message : 'Generation failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
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
