import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const MODEL_CHAT = 'claude-haiku-4-5-20251001';
const MODEL_BUILD = 'claude-sonnet-4-6';

const CHAT_SYSTEM = `You are Sitezix's friendly assistant. Sitezix is an AI tool that builds beautiful websites from a description.

Your job:
- Have natural conversation in the user's language. Detect from their message: Spanish ("hola", "qué tal", "cómo estás"), English ("hi", "hello"), etc. Match their language.
- Be warm, concise, helpful. Like Claude or ChatGPT — never robotic.
- Reply length: 1-3 sentences. No markdown, no code, no headers.

TOOL USE — when to call build_website:
- ONLY when the user has clearly described a website they want you to build right now. Examples: "make me a SaaS landing for my AI product", "una landing para mi cafetería de Madrid", "I want a portfolio site to show my photography", "construye una tienda online de zapatillas".
- Do NOT call the tool for: greetings, small talk, questions about Sitezix, vague messages, ambiguous intent, single-word replies. Just chat.
- If unsure, DON'T call the tool. Ask a clarifying question instead.

WHEN JUST CHATTING:
- Greetings ("hola", "hi", "qué tal"): greet back warmly, then ask what kind of website they want to build. Offer 2-3 concrete examples (e.g. "una landing para tu negocio, un portafolio personal, o una tienda online").
- Small talk ("cómo estás", "how are you"): respond naturally, then gently steer toward what they want to build.
- Questions about Sitezix: explain briefly that Sitezix builds full websites from a description in seconds, then ask what they'd like to make.
- Vague ideas ("quiero algo bonito", "I need a website"): ask 1-2 clarifying questions (what's it for? who's the audience?).`;

const DESIGN_SYSTEM = `You are an elite product designer and front-end engineer. Your output is single-file HTML websites with the visual polish of Stripe, Linear, Vercel, Apple, and Notion.

OUTPUT FORMAT:
Return ONLY the complete HTML file. Start with <!DOCTYPE html>. No markdown fences. No explanations. No commentary.

TECH STACK (use exactly this):
- Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts: <link> tags in <head>. Choose a tasteful pairing:
  • SaaS / tech / startup: "Inter" (400, 500, 600, 700) — clean, modern
  • Editorial / agency / luxury: "Playfair Display" (display) + "Inter" (body)
  • Bold / brutalist: "Space Grotesk" + "Inter Tight"
  • Friendly / consumer: "Plus Jakarta Sans" or "DM Sans"
- Lucide icons: <script src="https://unpkg.com/lucide@latest"></script>, then call lucide.createIcons() on DOMContentLoaded. Use <i data-lucide="check"></i> syntax.
- Images: https://source.unsplash.com/1200x800/?{keyword1},{keyword2} — pick 2 specific keywords per image (e.g. "modern,office", "developer,laptop"). Use width/height appropriate to layout.
- Tailwind config: extend in a <script> tag if you need custom colors or fonts.

DESIGN RULES — NON-NEGOTIABLE:

1. ONE primary brand color. Pick a refined hex from this palette by mood:
   - Tech / SaaS: #6366f1 (indigo), #8b5cf6 (violet), #0ea5e9 (sky)
   - Premium / luxury: #18181b (near-black), #84cc16 (lime accent on dark)
   - Friendly / startup: #f97316 (orange), #ec4899 (pink), #10b981 (emerald)
   - Editorial: #18181b + a single accent
   Use the primary color SPARINGLY: CTAs, links, active states, eyebrow labels, accent borders. Everything else is neutrals (whites, grays #f9fafb to #18181b).

2. NEVER use cheap gradients (no purple-to-pink, no rainbow). Allowed: a single very subtle radial gradient behind the hero (10% opacity max), or a tasteful linear-gradient on a primary CTA.

3. Typography hierarchy:
   - Hero h1: text-5xl md:text-7xl, font-semibold, tracking-tight, leading-[1.05]
   - Section h2: text-3xl md:text-5xl, font-semibold, tracking-tight
   - Subheadline: text-lg md:text-xl, text-gray-600, leading-relaxed, max-w-2xl
   - Body: text-base, text-gray-600, leading-relaxed
   - Eyebrow: text-sm font-semibold uppercase tracking-wider, primary color
   - Use font-feature-settings or tracking-tight on display text for that polished look.

4. Spacing — generous and consistent:
   - Sections: py-20 md:py-32
   - Container: max-w-6xl mx-auto px-6 (or max-w-7xl for grid-heavy pages)
   - Vertical rhythm between elements: space-y-6, space-y-8, space-y-12

5. Cards / panels:
   - Background: bg-white (light) or bg-gray-900 (dark)
   - Border: border border-gray-200 (light) or border-gray-800 (dark)
   - Radius: rounded-2xl
   - Padding: p-6 md:p-8
   - Shadow: NO shadow by default. On hover: hover:shadow-lg transition-shadow duration-300
   - NO heavy drop shadows. NO neon glows. NO 3D effects.

6. Buttons:
   - Primary: bg-[primary] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition (or rounded-lg for tech-leaning brands)
   - Secondary: bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-6 py-3 rounded-full
   - Add subtle icon (Lucide arrow-right) on primary CTAs.

7. Navbar:
   - sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100
   - Height: h-16, max-w-6xl container
   - Layout: logo left, nav links center (hidden md:flex), CTA right
   - Logo: small icon + brand name, text-lg font-semibold

8. Hero — must include:
   - Eyebrow label (e.g. "INTRODUCING" or "FOR DEVELOPERS")
   - Large headline (1-2 lines max, breakable with <br /> on md)
   - Supporting paragraph (max-w-2xl, text-gray-600)
   - 1-2 CTAs (primary + secondary)
   - Optional: hero visual (Unsplash image, mockup, or abstract gradient panel) — but ALWAYS center the hero text on smaller screens

9. Sections to include in a typical landing (adapt to the request):
   - Nav
   - Hero
   - Logo strip (5-7 grayscale "as seen on" logos — use small text labels styled as logos if no Unsplash works)
   - Features (3-column grid with Lucide icons in colored squares)
   - How it works (3-step process with numbers)
   - Showcase / Use cases (image + text alternating)
   - Testimonials (1 large pull quote + 3 smaller cards)
   - Pricing (3 tiers, middle one highlighted with primary color border)
   - FAQ (collapsible details/summary)
   - Final CTA banner (full-width section, primary tinted background)
   - Footer

10. Footer: bg-gray-950 text-gray-400, columns for Product/Company/Resources/Legal, brand mark + tagline left, social icons (Lucide), copyright at bottom border-t border-gray-800.

11. Responsive — mobile-first:
    - Test mentally at 375px (single column, stacked), 768px (tablet, 2 cols), 1280px (desktop, full grid).
    - Use md: and lg: breakpoints for layout shifts.
    - Hero text scales down. Padding scales down. Grids collapse to 1 column.

12. Animations — subtle ONLY:
    - transition-all duration-300 on hovers
    - Optional: a single fade-in via opacity transition on scroll using IntersectionObserver
    - NO bouncing, NO spinning, NO parallax, NO marquee unless the brand is bold/playful, NO scroll-jacking.

13. Copy — write real, specific, on-brand copy. NEVER Lorem Ipsum. NEVER generic ("Lorem", "Sample text", "Your tagline here"). Match the user's industry. Use specific numbers (e.g. "10x faster", "$2.4B processed", "Trusted by 12,000 teams").

14. Accessibility: alt text on every image, semantic HTML (header/nav/main/section/article/footer), aria-label on icon-only buttons, sufficient color contrast (gray-600 minimum on white).

QUALITY BAR:
This must look like it cost $5,000 to design. If a senior designer at Linear or Stripe would call it ugly or generic, rewrite it. Specifically avoid:
- Centered single-column layouts that look like Bootstrap defaults
- Bright blue buttons on white
- Stock "purple gradient" hero
- Tiny cramped sections
- Walls of text without visual rhythm
- Random emojis instead of proper icons

Take your time. Make every section earn its place. The HTML can be 600-1200 lines — that's fine. Quality over brevity.`;

const ACK_FALLBACK_ES = '¡Perfecto, lo construyo ahora!';
const ACK_FALLBACK_EN = 'Got it — building it now!';
const CHAT_FALLBACK_ES = '¡Hola! Cuéntame qué tipo de web quieres construir — por ejemplo, una landing para tu negocio, un portafolio personal, o una tienda online.';
const CHAT_FALLBACK_EN = "Hi! Tell me what kind of website you'd like — for example, a SaaS landing, a portfolio, or an online shop.";

function detectSpanish(s: string, history: { content: string }[]): boolean {
  const corpus = s + ' ' + history.map((m) => m.content).join(' ');
  return /[ñáéíóúü¿¡]|\b(hola|qué|que|cómo|como|tal|gracias|por\s+favor|porfa|vale|hazme|construye|crea|necesito|quiero|página|sitio|tienda|portafolio|blog|saludos|buenas)\b/i.test(corpus);
}

function stripFences(s: string): string {
  return s
    .replace(/^```(?:html|HTML)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };
type IntentResult =
  | { kind: 'chat'; reply: string }
  | { kind: 'build'; ack: string; brief: string; businessType: string };

async function classifyIntent(
  client: Anthropic,
  prompt: string,
  history: ChatMsg[],
  features: string,
  isSpanish: boolean,
): Promise<IntentResult> {
  const userText = features ? `${prompt}\n\n[Requested capabilities: ${features}]` : prompt;
  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];

  try {
    const res = await client.messages.create({
      model: MODEL_CHAT,
      max_tokens: 600,
      system: CHAT_SYSTEM,
      tools: [
        {
          name: 'build_website',
          description: 'Trigger full website generation. Call this ONLY when the user has clearly described a website they want you to build right now.',
          input_schema: {
            type: 'object',
            properties: {
              ack: {
                type: 'string',
                description: 'Short confirmation message in the user\'s language, e.g. "¡Perfecto, lo construyo ahora!" or "Got it, building it now!". 1 sentence max.',
              },
              websiteBrief: {
                type: 'string',
                description: 'A clear, expanded brief of what the user wants built (2-4 sentences). Restate their intent with any inferred context like target audience and tone.',
              },
              businessType: {
                type: 'string',
                description: 'Category, e.g. "saas-landing", "portfolio", "ecommerce", "agency", "blog", "restaurant", "personal-brand".',
              },
            },
            required: ['ack', 'websiteBrief', 'businessType'],
          },
        },
      ],
      messages,
    });

    if (res.stop_reason === 'tool_use') {
      const toolBlock = res.content.find((b) => b.type === 'tool_use');
      if (toolBlock && toolBlock.type === 'tool_use') {
        const input = toolBlock.input as {
          ack?: string;
          websiteBrief?: string;
          businessType?: string;
        };
        return {
          kind: 'build',
          ack: input.ack?.trim() || (isSpanish ? ACK_FALLBACK_ES : ACK_FALLBACK_EN),
          brief: input.websiteBrief?.trim() || prompt,
          businessType: input.businessType?.trim() || 'website',
        };
      }
    }

    const textBlock = res.content.find((b) => b.type === 'text');
    const reply =
      textBlock && textBlock.type === 'text' && textBlock.text.trim()
        ? textBlock.text.trim()
        : isSpanish
          ? CHAT_FALLBACK_ES
          : CHAT_FALLBACK_EN;
    return { kind: 'chat', reply };
  } catch {
    return {
      kind: 'chat',
      reply: isSpanish
        ? 'Hubo un problema procesando tu mensaje. ¿Puedes describirme qué tipo de web quieres construir?'
        : 'Something went wrong reading your message. Could you describe the kind of site you want to build?',
    };
  }
}

async function buildSite(client: Anthropic, brief: string, businessType: string, features: string): Promise<string> {
  const userMsg = [
    `Build a complete, production-quality website.`,
    ``,
    `Brief: ${brief}`,
    `Type: ${businessType}`,
    features ? `Required capabilities: ${features}` : '',
    ``,
    `Return ONLY the complete HTML file starting with <!DOCTYPE html>.`,
  ].filter(Boolean).join('\n');

  const res = await client.messages.create({
    model: MODEL_BUILD,
    max_tokens: 16000,
    system: [
      {
        type: 'text',
        text: DESIGN_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMsg }],
  });

  const textBlock = res.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Model returned no text content');
  }
  const html = stripFences(textBlock.text);
  if (!/<!DOCTYPE html>/i.test(html)) {
    throw new Error('Model returned invalid HTML (missing doctype)');
  }
  return html;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, features, history } = await request.json().catch(() => ({}));
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const safeHistory: ChatMsg[] = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
    : [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('credits, full_name')
    .eq('id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const featureNote = features
    ? Object.entries(features as Record<string, boolean>)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')
    : '';

  const client = new Anthropic({ apiKey });
  const isSpanish = detectSpanish(prompt, safeHistory);

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

        // ── Step 1: classify intent (Haiku 4.5 with tool-use) ──
        const intent = await classifyIntent(client, prompt, safeHistory, featureNote, isSpanish);

        if (intent.kind === 'chat') {
          await admin.from('chat_history').insert({
            user_id: user.id,
            role: 'assistant',
            content: intent.reply.slice(0, 2000),
          });
          send({ type: 'chat', reply: intent.reply });
          controller.close();
          return;
        }

        // ── Build path: ack first, then generate ──
        if (profile.credits < 1) {
          send({ type: 'error', error: 'No credits remaining' });
          controller.close();
          return;
        }

        send({ type: 'ack', reply: intent.ack });
        send({ type: 'progress', step: 1, message: 'Designing your site...' });

        let html: string;
        try {
          html = await buildSite(client, intent.brief, intent.businessType, featureNote);
        } catch (e) {
          send({ type: 'error', error: e instanceof Error ? e.message : 'Generation failed' });
          controller.close();
          return;
        }

        send({ type: 'progress', step: 3, message: 'Almost ready...' });

        await admin.from('chat_history').insert({
          user_id: user.id,
          role: 'assistant',
          content: html.slice(0, 50000),
        });

        const projectName =
          intent.brief.split(/\s+/).slice(0, 5).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').slice(0, 60) ||
          prompt.split(/\s+/).slice(0, 4).join(' ').slice(0, 60) ||
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
