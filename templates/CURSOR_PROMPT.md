# Sitezix — Cursor prompt: create a new pre-built HTML template

## Context

Sitezix is a Next.js SaaS that generates and deploys websites for users.
When a user asks for a website with a known `templateId`, the server does NOT call Claude Sonnet (expensive, slow). Instead it:
1. Loads a pre-built HTML file (already written, stored in `lib/template-html/`)
2. Calls Claude Haiku once to get ~50 variable values as JSON (~300 output tokens)
3. Does string replacement: `{{VARIABLE_NAME}}` → real value
4. Runs the result through the existing image + logo pipeline

This is ~95% cheaper than generating HTML from scratch.

---

## Your task

Convert the HTML page I give you into a Sitezix template. Follow every step below exactly.

---

## Step 1 — Create `lib/template-html/{template-id}.ts`

- Choose a kebab-case id for the template (e.g. `ceramics-shop`, `saas-landing`, `restaurant`)
- Create the file `lib/template-html/{template-id}.ts`
- Export a single `const {camelCaseId}Template: string` that is the full HTML wrapped in backtick template literal
- Keep the full Tailwind CDN stack intact:
  - `<script src="https://cdn.tailwindcss.com"></script>`
  - `<script src="https://unpkg.com/lucide@latest"></script>` + `lucide.createIcons()` on DOMContentLoaded
  - Google Fonts `<link>` in `<head>`
- Replace every piece of real content with `{{VARIABLE_NAME}}` placeholders (see conventions below)
- For images: use `src="IMG:{{Pn_IMG}}"` — the server already replaces `IMG:keywords` with real photos
- For the logo: use `src="LOGO_PLACEHOLDER"` — the server replaces it with an AI-generated logo
- Primary color: use `{{PRIMARY_COLOR}}` everywhere you need the brand color (in `style=` attributes, not arbitrary Tailwind classes)

### Placeholder naming conventions

| What | Format | Examples |
|---|---|---|
| Brand/business name | `{{BRAND_NAME}}` | Used in navbar, footer, title |
| Brand color (hex) | `{{PRIMARY_COLOR}}` | `#6366f1` |
| Page title | `{{SHOP_TITLE}}` or `{{PAGE_TITLE}}` | Hero headline |
| Tagline | `{{BRAND_TAGLINE}}` | One-line description |
| Currency symbol | `{{CURRENCY}}` | R, €, $, £ |
| Category pill N (1–8) | `{{CAT1}}` … `{{CAT8}}` | "Coffee", "Takeout" |
| Sidebar filter N (1–10) | `{{TF1}}` … `{{TF10}}` | "Cup Lids", "Containers" |
| Material filter N (1–8) | `{{MF1}}` … `{{MF8}}` | "Kraft Paper", "PET" |
| Product N name | `{{P1_NAME}}` … `{{P12_NAME}}` | "Kraft Coffee Cup" |
| Product N price | `{{P1_PRICE}}` … | Number only, no symbol |
| Product N badge | `{{P1_BADGE}}` … | "New", "Promo", "" |
| Product N image | `{{P1_IMG}}` … | Comma-separated keywords |
| Promo threshold | `{{PROMO_THRESHOLD}}` | "R500" |
| Rewards % | `{{REWARDS_PERCENT}}` | "5%" |
| CTA headline | `{{CTA_TITLE}}` | |
| CTA eyebrow | `{{CTA_SUBTITLE}}` | |
| Footer blurb | `{{FOOTER_TAGLINE}}` | |
| Contact URL | `{{CONTACT_URL}}` | Default "#" |
| Social URLs | `{{FACEBOOK_URL}}`, `{{INSTAGRAM_URL}}`, `{{LINKEDIN_URL}}` | Default "#" |
| Copyright year | `{{COPYRIGHT_YEAR}}` | "2025" |

- Use `UPPER_SNAKE_CASE` for all keys
- Add a CSS rule `.badge:empty { display: none }` so empty badges auto-hide
- Do NOT use `{{ }}` inside JavaScript strings in `<script>` blocks — only in HTML attributes and text nodes

---

## Step 2 — Register the template in `app/api/generate/route.ts`

Open `app/api/generate/route.ts`. Find `TEMPLATE_REGISTRY` (near line 309) and add your template:

```typescript
import { yourNewTemplate } from '@/lib/template-html/your-template-id';

const TEMPLATE_REGISTRY: Record<string, string> = {
  'packaging-shop': packagingShopTemplate,
  'your-template-id': yourNewTemplate,   // ← add this line
};
```

---

## Step 3 — Update `buildSiteFromTemplate()` if needed

The function `buildSiteFromTemplate()` in `route.ts` (around line 313) calls Claude Haiku and asks it to fill in variable values.

- If your new template uses the same variables as `packaging-shop`, no changes needed — Haiku will fill them in from the generic prompt.
- If your template has **different or extra variables**, update the prompt string inside `buildSiteFromTemplate()` to mention the new keys.
- For templates with a completely different structure (e.g. a SaaS landing with no product grid), create a separate function `buildSiteFromTemplate_{id}()` and call it from the registry check.

---

## Step 4 — Add to `templates/catalog/manifest.json`

Add a new entry to the `"templates"` array:

```json
{
  "id": "your-template-id",
  "name": "Human-readable template name",
  "category": "ecommerce",
  "generator": {
    "module": "lib/template-prompts.ts",
    "method": "resolveLayoutPromptExtra",
    "dashboardTemplateId": "your-template-id"
  },
  "files": ["your-template-id.spec.txt"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "notes": "Short description of the template style and origin."
}
```

---

## Step 5 — Create `templates/catalog/{template-id}.spec.txt`

Create a short text file with 5–10 lines documenting:
- What the template looks like
- Where the HTML lives
- Key design decisions
- How to add more templates (reference this CURSOR_PROMPT.md)

---

## Full variable list for `packaging-shop` (for reference)

The existing packaging-shop template uses these variables in order:

`BRAND_NAME`, `PRIMARY_COLOR`, `SHOP_TITLE`, `BRAND_TAGLINE`, `SEARCH_PLACEHOLDER`,
`CURRENCY`, `CONTACT_URL`,
`CAT1`–`CAT8`,
`TF1`–`TF10`, `MF1`–`MF8`,
`P1_NAME`–`P12_NAME`, `P1_PRICE`–`P12_PRICE`, `P1_BADGE`–`P12_BADGE`, `P1_IMG`–`P12_IMG`,
`PROMO_THRESHOLD`, `REWARDS_PERCENT`,
`CTA_TITLE`, `CTA_SUBTITLE`,
`FOOTER_TAGLINE`, `FACEBOOK_URL`, `INSTAGRAM_URL`, `LINKEDIN_URL`, `COPYRIGHT_YEAR`

---

## Notes

- Keep every `<script>` and `<style>` tag from the original — just remove real text/image content
- Never put real images in the template — only `IMG:` placeholders
- Never put real logos — only `LOGO_PLACEHOLDER`
- The HTML file can be 300–600 lines. That is fine.
- After adding the template, test it by setting `templateId: "your-template-id"` in a request to `/api/generate`
