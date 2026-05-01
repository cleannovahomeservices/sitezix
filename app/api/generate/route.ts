import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const MODEL_INTENT = 'meta-llama/llama-3.3-70b-instruct:free';
const MODEL_ANALYZE = 'meta-llama/llama-3.3-70b-instruct:free';
const MODEL_STRUCTURE = 'qwen/qwen3-coder:free';
const MODEL_POLISH = 'anthropic/claude-sonnet-4.5';

const INTENT_PROMPT = `You are Sitezix's chat assistant. Sitezix is an AI website builder.

Decide what the user wants from their latest message in the conversation:
- "build" — they're describing a website to create (e.g. "make me a portfolio", "una landing para mi cafetería", "I want a SaaS site for my product").
- "chat" — anything else: greeting, vague message, small talk, asking what Sitezix does, asking for ideas, clarification questions, single words like "hola"/"hi"/"thanks".

Reply in the user's language (detect it). Always return ONLY valid minified JSON, no prose, no fences:
{"intent":"build"|"chat","reply":"..."}

Rules for "reply":
- If intent is "chat": 1-2 friendly sentences. If they haven't described a website yet, ask what kind they want to build (offer 2-3 concrete suggestions).
- If intent is "build": one short sentence in their language confirming you'll build it now (e.g. "¡Perfecto, lo construyo ahora!" / "Got it, building it now!").
- Never include markdown, code, or HTML in "reply".`;

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

type IntentResult = { intent: 'build' | 'chat'; reply: string };

const DEFAULT_CHAT_REPLY_ES =
  '¡Hola! Soy Sitezix. Cuéntame qué tipo de web quieres construir — por ejemplo: una landing para una app, un portafolio, una tienda online, o un blog.';
const DEFAULT_CHAT_REPLY_EN =
  "Hi! I'm Sitezix. Tell me what kind of website you'd like — for example: a SaaS landing, a portfolio, an online store, or a blog.";
const DEFAULT_BUILD_REPLY_ES = '¡Perfecto, lo construyo ahora!';
const DEFAULT_BUILD_REPLY_EN = 'Got it — building it now!';

function detectSpanish(s: string): boolean {
  return /[ñáéíóúü¿¡]|\b(hola|qué|que|cómo|como|tal|gracias|por\s+favor|porfa|vale|hazme|construye|crea|necesito|quiero|página|sitio|tienda|portafolio|blog|saludos|buenas)\b/i.test(s);
}

const BUILD_KEYWORDS = /\b(build|make|create|generate|design|website|site|landing|portfolio|shop|store|saas|dashboard|blog|app|construye|construir|crea|crear|hazme|haz(?:me)?|diseña|disena|necesito|quiero|p[aá]gina|sitio|tienda|portafolio|portfolio|landing)\b/i;

const GREETING_PATTERNS: RegExp[] = [
  /^(hola+|hi+|hello+|hey+|holi+|holu+|holaaa+|saludos|hola amigo)\b/i,
  /^(qu[eé] tal|que tal|c[oó]mo (estás|est[aá]s|va)|how are you|whats up|what's up|sup)\b/i,
  /^(buen(o|a)s)\b/i,
  /^(gracias|thanks|thx|ok|okey|okay|vale|s[ií]|no|nop|yep)\b\W*$/i,
  /^(ayuda|help|ideas?|sugerencias?|qu[eé] puedes hacer|what can you do|qui[eé]n eres|who are you|que eres|qu[eé] es esto|what is this)\b/i,
  /^[\?\!\.,\s]+$/,
];

function quickClassify(prompt: string): 'chat' | null {
  const cleaned = prompt.trim().toLowerCase();
  if (cleaned.length < 3) return 'chat';

  for (const p of GREETING_PATTERNS) {
    if (p.test(cleaned)) return 'chat';
  }

  const wordCount = cleaned.split(/\s+/).length;
  const hasBuildKw = BUILD_KEYWORDS.test(cleaned);

  // Short message with no build keywords → conversational
  if (wordCount <= 3 && !hasBuildKw) return 'chat';

  return null; // ambiguous, ask the LLM
}

async function classifyIntent(
  apiKey: string,
  prompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<IntentResult> {
  const isSpanish = detectSpanish(prompt) || history.some((m) => detectSpanish(m.content));

  // ── Fast path: heuristic for obvious chat ──
  const quick = quickClassify(prompt);
  if (quick === 'chat') {
    return {
      intent: 'chat',
      reply: isSpanish ? DEFAULT_CHAT_REPLY_ES : DEFAULT_CHAT_REPLY_EN,
    };
  }

  // ── Strong signal for build: long message OR build keywords present ──
  const wordCount = prompt.trim().split(/\s+/).length;
  if (wordCount >= 6 || BUILD_KEYWORDS.test(prompt)) {
    return {
      intent: 'build',
      reply: isSpanish ? DEFAULT_BUILD_REPLY_ES : DEFAULT_BUILD_REPLY_EN,
    };
  }

  // ── Ambiguous: ask the LLM ──
  const transcript = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
  const userBlock = transcript
    ? `Conversation so far:\n${transcript}\n\nLatest user message:\n${prompt}`
    : `Latest user message:\n${prompt}`;

  try {
    const raw = await callOpenRouter(apiKey, MODEL_INTENT, INTENT_PROMPT, userBlock, 300);
    const cleaned = stripFences(raw);
    let parsed: { intent?: string; reply?: string } = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }
    if (parsed.intent === 'chat' || parsed.intent === 'build') {
      const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
        ? parsed.reply.trim()
        : parsed.intent === 'chat'
          ? (isSpanish ? DEFAULT_CHAT_REPLY_ES : DEFAULT_CHAT_REPLY_EN)
          : (isSpanish ? DEFAULT_BUILD_REPLY_ES : DEFAULT_BUILD_REPLY_EN);
      return { intent: parsed.intent, reply };
    }
  } catch {
    // fall through
  }

  // ── Default for ambiguous + LLM failure: chat (safer than building junk) ──
  return {
    intent: 'chat',
    reply: isSpanish
      ? '¿Puedes darme un poco más de detalle sobre la web que quieres construir?'
      : 'Could you give me a bit more detail about the website you want to build?',
  };
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

  const { prompt, features, history } = await request.json().catch(() => ({}));
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }
  const safeHistory: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }))
    : [];

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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

        // ── Step 0: classify intent (chat vs build) ─────────────────
        if (apiKey && apiKey !== 'PLACEHOLDER_REPLACE_ME') {
          const intent = await classifyIntent(apiKey, prompt, safeHistory);
          if (intent.intent === 'chat') {
            await admin.from('chat_history').insert({
              user_id: user.id,
              role: 'assistant',
              content: intent.reply.slice(0, 2000),
            });
            send({ type: 'chat', reply: intent.reply });
            controller.close();
            return;
          }
          // For build intent, surface the assistant's confirmation as a chat-style reply
          // before progress events kick in.
          send({ type: 'ack', reply: intent.reply });
        }

        if (profile.credits < 1) {
          send({ type: 'error', error: 'No credits remaining' });
          controller.close();
          return;
        }

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
          } catch {
            // Fall back to a minimal skeleton derived from the analysis so step 3 can still polish.
            structureHtml = buildSkeleton(analysis, prompt);
          }
          if (!structureHtml || structureHtml.length < 80) {
            structureHtml = buildSkeleton(analysis, prompt);
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

function buildSkeleton(a: AnalysisJson, prompt: string): string {
  const sections = a.sections.map((s) => {
    const k = s.toLowerCase();
    const kw = a.imageKeywords[0] || 'business';
    if (k.includes('hero')) {
      return `<section class="hero"><h1>${a.businessType}</h1><p>${prompt}</p><a href="#cta" class="btn-primary">Get started</a><img src="UNSPLASH:${kw}" alt="${a.businessType}" /></section>`;
    }
    if (k.includes('feature')) {
      return `<section class="features"><h2>Features</h2><div class="grid"><article><h3>Fast</h3><p>Quick and reliable.</p></article><article><h3>Simple</h3><p>Easy to use.</p></article><article><h3>Powerful</h3><p>Built to scale.</p></article></div></section>`;
    }
    if (k.includes('pricing')) {
      return `<section class="pricing"><h2>Pricing</h2><div class="grid"><article><h3>Starter</h3><p>$9/mo</p></article><article><h3>Pro</h3><p>$29/mo</p></article><article><h3>Team</h3><p>$99/mo</p></article></div></section>`;
    }
    if (k.includes('testim')) {
      return `<section class="testimonials"><h2>What customers say</h2><blockquote>"This changed how we work."<cite>— Happy customer</cite></blockquote></section>`;
    }
    if (k.includes('cta')) {
      return `<section id="cta" class="cta"><h2>Ready to start?</h2><a href="#" class="btn-primary">Get started</a></section>`;
    }
    if (k.includes('footer')) {
      return `<footer><p>&copy; ${new Date().getFullYear()} ${a.businessType}</p></footer>`;
    }
    return `<section><h2>${s}</h2><p>Content for ${s}.</p></section>`;
  }).join('\n');
  return `<header><nav><a href="#" class="logo">${a.businessType}</a><a href="#cta" class="btn-primary">Get started</a></nav></header>\n<main>${sections}</main>`;
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
