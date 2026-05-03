/**
 * Fragments appended to Claude's build prompt so generated HTML matches our stack:
 * single-file Tailwind CDN + Lucide + IMG:keywords + LOGO_PLACEHOLDER, deployable as Vercel static index.html.
 */

const ECOMMERCE_CATALOG_PROMPT = `
ECOMMERCE CATALOG MODE (mandatory structure for THIS build):
Produce a SINGLE self-contained storefront page (catalog + filtering UI), NOT a generic marketing landing unless the brief also asks for long-form storytelling above the fold.

Use the SAME technical stack as the global instructions: Tailwind via CDN script, Lucide via unpkg + lucide.createIcons() on DOMContentLoaded, src="IMG:keyword1,keyword2" on photos, src="LOGO_PLACEHOLDER" for the logo everywhere it appears.

LAYOUT RULES — follow closely:
1) Navbar (sticky): logo + brand wordmark + compact nav links + cart icon/link (href="#cart" or javascript:void(0) with aria-label) + primary small CTA. Keep it airy (h-16, backdrop blur).

2) Shop header band: eyebrow pill (muted), H1 tailored to brief (store value prop), one-line subtitle (text-gray-600 max-w-xl), then a PROMINENT search row: rounded-2xl border border-gray-200 bg-white px-4 py-3 md:py-3.5 flex items-center gap-3 shadow-sm with Lucide search icon and a full-width text input placeholder like "Buscar productos…".

3) Toolbar under header: py-6 flex flex-wrap gap-4 items-center justify-between border-b border-gray-100
   - Mobile: rounded-full border border-gray-200 px-4 py-2 text-sm with Lucide sliders-horizontal labeled "Filters" (opens nothing heavy — optional details or just visual).
   - Category pills row: horizontally scrollable on small screens — flex gap-2 overflow-x-auto. Each pill rounded-full px-4 py-2 text-sm border transition; active pill uses primary color border + soft bg tint (use arbitrary values with the given primary hex, e.g. border-[COLOR] bg-[COLOR]/10 text-[COLOR]).
   - Sort: labeled "Sort" or "Ordenar" + native select with rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm.

4) MAIN two-column catalog (desktop):
   - Outer wrapper: max-w-7xl mx-auto px-6 py-10 flex gap-12 items-start
   - ASIDE FILTERS — hidden below lg:hidden is OK if you add a concise mobile drawer via <details class="lg:hidden"> or omit mobile complexity but MUST show filters on lg: as sticky top-28 w-72 shrink-0 space-y-4
     • Two accordion groups wrapped in bordered rounded-2xl p-5 bg-gray-50/50: use <details open> per group with summary cursor-pointer font-semibold flex justify-between items-center
     • 6–10 realistic checkbox filters (adapt labels to the industry in the brief: e.g. ceramics → "Cuencos", "Platos", "Tazas", "Esmaltado mate", etc.).
     • "Clear filters" text button at bottom of aside (muted link).
   - PRODUCT GRID — flex-1 min-w-0: grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12

5) Product cards (premium, not cluttered):
   - Card: rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300
   - Image area aspect-square bg-gray-50 relative overflow-hidden
   - Use IMG: placeholders with THEMED keywords matching each item (vary keywords; adjacent cards must not reuse identical IMG strings).
   - Optional badge top-3 left-3 text-xs font-medium rounded-full px-2.5 py-0.5 (New / Promo / Handmade)
   - Body p-5: product name title case font-medium text-lg tracking-tight, short one-line muted descriptor optional
   - Price row: small "Desde" or "From" in text-gray-500 + bold price in text-gray-900 text-xl tabular-nums
   - Subtle footer action: rounded-full border border-gray-200 w-full py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition with Lucide plus or shopping-bag icon span + "Añadir" style label (frontend-only, no backend)

6) PROMO TILES embedded in grid: place exactly TWO promotional blocks that span full width on sm+ within the grid (col-span-full sm:col-span-2 xl:col-span-3) alternating pattern — dashed border rounded-3xl bg-gradient-to-br from-gray-50 via-white to-primary/5 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8: one focuses on shipping/returns/USPs, another on signup/rewards/newsletter tone. Include Lucide icon in a rounded-2xl p-4 bg-white border border-gray-100 shadow-sm.

7) End of grid row: centered "Load more" or "Ver más" ghost button rounded-full px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition — decorative only.

8) Finish with FULL-WIDTH PREMIUM FOOTER consistent with global design rules (columns, newsletter optional, copyright, muted social placeholders using Lucide icon buttons).

CONTENT: invent 12–18 product names AND plausible prices coherent with locale/currency hinted in brief (EUR for Spain, USD if English US, etc.). No Lorem ipsum. Every image must remain IMG: or LOGO placeholders.

PRIMARY COLOR — use ONLY the hex provided in the user message for accents (pills, buttons, badges, underline), keep backgrounds mostly white/neutral.`;


const PACKAGING_SHOP_PROMPT = `
PACKAGING / SUPPLIES SHOP MODE (mandatory structure for THIS build):
Produce a SINGLE self-contained B2B/B2C packaging supplies storefront. Think yucca.co.za aesthetic: clean white background, dark near-black (#1D1D1B) typography, subtle borders, minimal use of color accent only for CTAs and active states.

Use the SAME technical stack: Tailwind via CDN, Lucide via unpkg + lucide.createIcons() on DOMContentLoaded, src="IMG:keyword1,keyword2" on photos, src="LOGO_PLACEHOLDER" for the logo.

LAYOUT RULES — follow closely:

1) NAVBAR (sticky, h-16 backdrop-blur-sm bg-white/90 border-b border-gray-100):
   - Left: LOGO_PLACEHOLDER wordmark (h-8)
   - Center (desktop): nav links — Shop | Solutions | Company | Resources | Contact
   - Right: cart icon (Lucide shopping-cart, badge with item count "0") + "Login" pill button (rounded-full px-5 py-2 text-sm border border-gray-800 hover:bg-gray-900 hover:text-white transition)
   - Mobile: hamburger toggle (three lines → X)

2) HERO / SHOP HEADER (bg-white py-16 border-b border-gray-100):
   - Full-width centered column max-w-3xl mx-auto text-center px-6
   - H1 large (text-5xl font-light tracking-tight text-gray-900) — value prop tailored to brief
   - Subtitle one line text-gray-500 mt-3
   - SEARCH BAR below (mt-8 mx-auto max-w-xl): rounded-2xl border border-gray-200 bg-white px-5 py-3.5 flex items-center gap-3 shadow-sm — Lucide search icon text-gray-400 + full-width input placeholder "Search products…"

3) CATEGORY FILTER TOOLBAR (bg-white border-b border-gray-100 sticky top-16 z-10):
   - max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto
   - Left: "Filter" button (rounded-full border border-gray-200 px-4 py-2 text-sm flex gap-2 items-center with Lucide sliders-horizontal)
   - Category pills scrollable: rounded-full px-4 py-2 text-sm border transition; active pill: bg-gray-900 text-white border-gray-900; inactive: border-gray-200 text-gray-600 hover:border-gray-400
   - Categories vary by brief (e.g., packaging: Coffee | Smoothies | Deli | Takeout | Bags & Pouches | Promo)
   - Right: Sort select (rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ml-auto shrink-0)

4) MAIN BODY (max-w-7xl mx-auto px-6 py-10 flex gap-10 items-start):
   ASIDE SIDEBAR (hidden on mobile, lg:block w-64 shrink-0 sticky top-36):
   - "Filters" heading text-sm font-semibold text-gray-900 mb-4 + "Clear all" text-xs text-gray-400 ml-auto
   - 2–3 <details open> accordion groups, each: rounded-2xl border border-gray-200 p-5 mb-3 bg-white
     • <summary> font-medium text-sm flex justify-between items-center cursor-pointer + Lucide chevron-down
     • 6–8 checkboxes with label: flex items-center gap-2.5 text-sm text-gray-600 py-1.5 cursor-pointer hover:text-gray-900
     • Filter labels themed to industry (e.g., packaging type: "Cup Lids", "Containers", "Bags"; material: "Kraft Paper", "Clear PET", "Sugarcane")

   PRODUCT GRID (flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8):

5) PRODUCT CARDS (clean, airy, no clutter):
   - rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300
   - Image area: aspect-[4/3] bg-gray-50 overflow-hidden relative — IMG: with 2–3 themed keywords (vary per card)
   - Optional badge top-3 left-3: rounded-full text-xs px-2.5 py-0.5 font-medium (New / Eco / Best Seller) bg-emerald-50 text-emerald-700 or bg-amber-50 text-amber-700
   - Body p-5:
     • Product name: font-medium text-gray-900 text-base leading-snug
     • Short muted descriptor: text-xs text-gray-400 mt-0.5 (e.g., "Pack of 50 • Kraft")
     • Price row mt-3: text-xs text-gray-400 "From" + bold text-xl tabular-nums text-gray-900 (invent plausible B2B prices per brief locale)
     • Add button: mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 transition with Lucide plus

6) TWO PROMO TILES embedded in grid (col-span-full):
   - Tile A (shipping/USPs): rounded-3xl bg-gray-50 border border-dashed border-gray-200 p-8 flex flex-col md:flex-row items-center gap-6 — Lucide truck icon in a white rounded-2xl p-3 shadow-sm + headline + 3 USP bullet items (free shipping threshold, return policy, bulk pricing)
   - Tile B (newsletter/rewards): rounded-3xl bg-gray-900 text-white p-8 flex flex-col md:flex-row items-center gap-6 — Lucide mail icon + "Join X Rewards" headline + one-line description + email input rounded-xl bg-white/10 border border-white/20 placeholder-white/40 + "Subscribe" button

7) FOOTER (full-width bg-gray-50 border-t border-gray-200 mt-16):
   - max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10
   - Col 1: LOGO_PLACEHOLDER + 2-line brand blurb + social row (Lucide icon buttons: instagram, facebook, linkedin)
   - Cols 2–4: footer link groups (Shop, Solutions, Company) — each has a small-caps label text-xs text-gray-400 font-semibold tracking-widest mb-3 then 4–5 muted links
   - Bottom bar: border-t border-gray-200 mt-10 pt-6 flex justify-between text-xs text-gray-400

CONTENT RULES:
- Invent 12–15 product names coherent with industry in brief (packaging suppliers: cups, lids, containers, bags, labels, etc.)
- Prices in locale currency hinted in brief (ZAR R, EUR €, USD $, GBP £)
- Pack size descriptors (e.g., "50 units", "Case of 500", "Per roll")
- No Lorem ipsum anywhere
- Every image stays as IMG: placeholder, logo as LOGO_PLACEHOLDER

PRIMARY COLOR: use ONLY the hex provided in user message for active pills, CTA fills, badge tints. Keep rest white/gray/near-black.`;


export function resolveLayoutPromptExtra(
  businessType: string | undefined | null,
  templateId?: string | null | undefined,
): string {
  const tid = String(templateId || '').trim().toLowerCase().replace(/_/g, '-');
  const packagingIds = new Set(['packaging-shop', 'packaging-supplies', 'supplies-shop', 'b2b-packaging']);
  if (packagingIds.has(tid)) {
    return PACKAGING_SHOP_PROMPT;
  }

  const commerceIds = new Set(['ecommerce-shop-catalog', 'ecommerce-shop-filters-grid', 'ecommerce', 'shop-catalog']);
  if (commerceIds.has(tid)) {
    return ECOMMERCE_CATALOG_PROMPT;
  }

  const t = String(businessType || '').toLowerCase();
  if (
    /\b(packaging|envases|embalaje|supplies\s+shop|packaging\s+shop|food\s+packaging|takeaway\s+packaging)\b/i.test(t)
  ) {
    return PACKAGING_SHOP_PROMPT;
  }
  if (
    /\b(ecommerce|e-commerce|woocommerce|tienda(\s+online)?|online\s+shop|webshop|boutique\s+online|catalog(ue)?\s*store)\b/i.test(t)
  ) {
    return ECOMMERCE_CATALOG_PROMPT;
  }
  return '';
}
