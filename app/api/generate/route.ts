import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generateLogo } from '@/lib/logo';
import { replaceImagePlaceholders } from '@/lib/images';
import { resolveLayoutPromptExtra } from '@/lib/template-prompts';
import { packagingShopTemplate } from '@/lib/template-html/packaging-shop';

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
- Images: use src="IMG:keyword1,keyword2" — these placeholders will be replaced server-side with real Unsplash/Pexels URLs after generation. Pick 2 specific keywords per image (e.g. src="IMG:modern,office", src="IMG:developer,laptop"). For portrait images add |portrait, e.g. src="IMG:woman,smiling|portrait". Always include alt text.
- Logo: use src="LOGO_PLACEHOLDER" for the brand logo image. It will be replaced with a custom AI-generated logo. Use it in the navbar AND footer. Recommended sizes: w-8 h-8 in navbar, w-10 h-10 in footer.
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
  | { kind: 'build'; ack: string; brief: string; businessType: string; businessName: string; primaryColor: string };

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
              businessName: {
                type: 'string',
                description: 'Suggested brand/business name. If the user provided one, use exactly that. Otherwise invent something short, modern, brandable (1-2 words, no generic suffixes like "Hub" or "Labs" unless it fits).',
              },
              primaryColor: {
                type: 'string',
                description: 'Suggested primary brand color as a hex code, e.g. "#6366f1". Pick something tasteful that matches the industry and tone.',
              },
            },
            required: ['ack', 'websiteBrief', 'businessType', 'businessName', 'primaryColor'],
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
          businessName?: string;
          primaryColor?: string;
        };
        return {
          kind: 'build',
          ack: input.ack?.trim() || (isSpanish ? ACK_FALLBACK_ES : ACK_FALLBACK_EN),
          brief: input.websiteBrief?.trim() || prompt,
          businessType: input.businessType?.trim() || 'website',
          businessName: input.businessName?.trim() || 'Untitled',
          primaryColor: (input.primaryColor || '').trim().match(/^#[0-9a-fA-F]{6}$/)
            ? (input.primaryColor as string).trim()
            : '#6366f1',
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

async function buildSite(
  client: Anthropic,
  brief: string,
  businessType: string,
  businessName: string,
  primaryColor: string,
  features: string,
  templateId: string | undefined,
): Promise<string> {
  const layoutExtra = resolveLayoutPromptExtra(businessType, templateId);
  const userMsg = [
    `Build a complete, production-quality website.`,
    ``,
    `Brief: ${brief}`,
    `Business name: ${businessName}`,
    `Type: ${businessType}`,
    `Primary color: ${primaryColor}`,
    features ? `Required capabilities: ${features}` : '',
    layoutExtra ? `${layoutExtra}` : '',
    ``,
    `IMPORTANT placeholders to use exactly as specified:`,
    `- For the brand logo image: src="LOGO_PLACEHOLDER" (used in navbar AND footer).`,
    `- For all photographic images: src="IMG:keyword1,keyword2" (e.g. src="IMG:modern,office", src="IMG:woman,smiling|portrait"). These are replaced with real Unsplash/Pexels images server-side.`,
    `- The brand wordmark next to the logo should be the business name "${businessName}".`,
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

const TEMPLATE_REGISTRY: Record<string, string> = {
  'packaging-shop': packagingShopTemplate,
};

async function buildSiteFromTemplate(
  client: Anthropic,
  brief: string,
  businessName: string,
  primaryColor: string,
  templateId: string,
): Promise<string | null> {
  const template = TEMPLATE_REGISTRY[templateId];
  if (!template) return null;

  const fillPrompt = `Business name: ${businessName}
Description: ${brief}

You are filling content for a shop website. Return ONLY a valid JSON object — no markdown, no explanation, nothing else before or after the JSON.

Fill every key with real content that matches the business. Language must match the description.

{
  "SHOP_TITLE": "4-6 word store headline",
  "BRAND_TAGLINE": "One sentence describing what the store sells",
  "SEARCH_PLACEHOLDER": "Short search hint e.g. Search products...",
  "CURRENCY": "Just the symbol: R or € or $ or £ — infer from the description locale",
  "CAT1": "Category name", "CAT2": "Category name", "CAT3": "Category name", "CAT4": "Category name",
  "CAT5": "Category name", "CAT6": "Category name", "CAT7": "Category name", "CAT8": "Category name",
  "TF1": "Type filter", "TF2": "Type filter", "TF3": "Type filter", "TF4": "Type filter", "TF5": "Type filter",
  "TF6": "Type filter", "TF7": "Type filter", "TF8": "Type filter", "TF9": "Type filter", "TF10": "Type filter",
  "MF1": "Material/attribute", "MF2": "Material/attribute", "MF3": "Material/attribute", "MF4": "Material/attribute",
  "MF5": "Material/attribute", "MF6": "Material/attribute", "MF7": "Material/attribute", "MF8": "Material/attribute",
  "P1_NAME": "Product name", "P1_PRICE": "19.99", "P1_BADGE": "New", "P1_IMG": "keyword1,keyword2",
  "P2_NAME": "Product name", "P2_PRICE": "34.99", "P2_BADGE": "", "P2_IMG": "keyword1,keyword2",
  "P3_NAME": "Product name", "P3_PRICE": "12.50", "P3_BADGE": "Promo", "P3_IMG": "keyword1,keyword2",
  "P4_NAME": "Product name", "P4_PRICE": "22.00", "P4_BADGE": "", "P4_IMG": "keyword1,keyword2",
  "P5_NAME": "Product name", "P5_PRICE": "8.99", "P5_BADGE": "", "P5_IMG": "keyword1,keyword2",
  "P6_NAME": "Product name", "P6_PRICE": "45.00", "P6_BADGE": "Best Seller", "P6_IMG": "keyword1,keyword2",
  "P7_NAME": "Product name", "P7_PRICE": "15.00", "P7_BADGE": "", "P7_IMG": "keyword1,keyword2",
  "P8_NAME": "Product name", "P8_PRICE": "28.00", "P8_BADGE": "New", "P8_IMG": "keyword1,keyword2",
  "P9_NAME": "Product name", "P9_PRICE": "19.99", "P9_BADGE": "", "P9_IMG": "keyword1,keyword2",
  "P10_NAME": "Product name", "P10_PRICE": "55.00", "P10_BADGE": "", "P10_IMG": "keyword1,keyword2",
  "P11_NAME": "Product name", "P11_PRICE": "9.50", "P11_BADGE": "Eco", "P11_IMG": "keyword1,keyword2",
  "P12_NAME": "Product name", "P12_PRICE": "32.00", "P12_BADGE": "", "P12_IMG": "keyword1,keyword2",
  "PROMO_THRESHOLD": "Free shipping threshold e.g. €50 or R500",
  "REWARDS_PERCENT": "e.g. 5%",
  "CTA_TITLE": "A compelling 6-10 word call to action",
  "CTA_SUBTITLE": "Short uppercase eyebrow e.g. READY TO ORDER",
  "FOOTER_TAGLINE": "One line brand description",
  "CONTACT_URL": "#",
  "FACEBOOK_URL": "#",
  "INSTAGRAM_URL": "#",
  "LINKEDIN_URL": "#"
}

Replace ALL placeholder descriptions (words in quotes like "Product name", "Category name", etc.) with real values for this business.
- CURRENCY: symbol only, no spaces
- P*_PRICE: digits only, no currency symbol (e.g. "12.99")
- P*_BADGE: "New", "Promo", "Best Seller", "Eco" or "" (empty string = no badge)
- P*_IMG: 2-3 comma-separated keywords for product image search (e.g. "ceramic,bowl,white")
- All 12 products must have a real name, price, and image keywords`;

  const res = await client.messages.create({
    model: MODEL_CHAT,
    max_tokens: 2000,
    system: 'You fill website template variables. Return ONLY a valid JSON object. No markdown fences, no text before or after the JSON.',
    messages: [{ role: 'user', content: fillPrompt }],
  });

  const textBlock = res.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return null;

  let vars: Record<string, string>;
  try {
    const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    vars = JSON.parse(raw);
  } catch {
    return null;
  }

  vars['BRAND_NAME'] = businessName;
  vars['PRIMARY_COLOR'] = primaryColor;
  vars['COPYRIGHT_YEAR'] = String(new Date().getFullYear());

  let html = template;
  for (const [key, value] of Object.entries(vars)) {
    html = html.split(`{{${key}}}`).join(value ?? '');
  }

  // If any placeholder was not filled (Haiku missed a key), remove it so the page doesn't show raw {{VAR}} text
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) {
    html = html.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
  }

  return html;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, features, history, templateId } = await request.json().catch(() => ({}));
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
        send({ type: 'progress', step: 1, message: 'Crafting your brand...' });

        // ── Logo + HTML in parallel ──
        const logoPromise = generateLogo({
          businessName: intent.businessName,
          businessType: intent.businessType,
          primaryColor: intent.primaryColor,
          brief: intent.brief,
        }).catch(() => null);

        send({ type: 'progress', step: 2, message: 'Designing layout...' });

        let html: string;
        try {
          const tid = typeof templateId === 'string' ? templateId.slice(0, 80) : undefined;
          const fromTemplate = tid
            ? await buildSiteFromTemplate(client, intent.brief, intent.businessName, intent.primaryColor, tid).catch(() => null)
            : null;

          if (fromTemplate) {
            html = fromTemplate;
          } else {
            html = await buildSite(
              client,
              intent.brief,
              intent.businessType,
              intent.businessName,
              intent.primaryColor,
              featureNote,
              tid,
            );
          }
        } catch (e) {
          send({ type: 'error', error: e instanceof Error ? e.message : 'Generation failed' });
          controller.close();
          return;
        }

        send({ type: 'progress', step: 3, message: 'Adding photos & logo...' });

        // Substitute placeholders: real images + AI logo
        try {
          html = await replaceImagePlaceholders(html);
        } catch {
          // continue with placeholders if image API fails
        }

        const logoDataUrl = await logoPromise;
        if (logoDataUrl) {
          html = html.split('LOGO_PLACEHOLDER').join(logoDataUrl);
        } else {
          // Fallback: replace with a transparent 1x1 so the site doesn't break
          html = html.split('LOGO_PLACEHOLDER').join(
            'data:image/svg+xml;utf8,' + encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${intent.primaryColor}"/><text x="16" y="22" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">${(intent.businessName[0] || 'S').toUpperCase()}</text></svg>`
            )
          );
        }

        send({ type: 'progress', step: 4, message: 'Almost ready...' });

        await admin.from('chat_history').insert({
          user_id: user.id,
          role: 'assistant',
          content: html.slice(0, 50000),
        });

        const projectName =
          intent.businessName.slice(0, 60) ||
          intent.brief.split(/\s+/).slice(0, 5).join(' ').slice(0, 60) ||
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
