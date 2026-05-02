// AI logo generation via OpenAI gpt-image-1 (DALL-E 3 fallback).
// Returns a base64 data URL for embedding directly in HTML.

type LogoSpec = {
  businessName: string;
  businessType: string;
  primaryColor?: string;
  brief?: string;
};

function buildLogoPrompt(spec: LogoSpec): string {
  const colorHint = spec.primaryColor ? ` Primary color: ${spec.primaryColor}.` : '';
  return `A modern, minimalist logo mark for a ${spec.businessType} called "${spec.businessName}". \
Clean vector style. Single icon symbol — abstract geometric mark, no text, no letters, no words. \
Solid white background. Professional, refined, suitable for a website navbar at small sizes. \
Flat design, sharp edges, no gradients, no shadows, no 3d effects.${colorHint} \
Style reference: Linear, Stripe, Vercel, Notion. Centered composition with generous padding around the mark.`;
}

export async function generateLogo(spec: LogoSpec): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = buildLogoPrompt(spec);

  // Try gpt-image-1 first (newer, usually higher quality and cheaper at "low")
  const tries: Array<{ url: string; body: Record<string, unknown> }> = [
    {
      url: 'https://api.openai.com/v1/images/generations',
      body: {
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'low',
        background: 'opaque',
        output_format: 'png',
      },
    },
    {
      url: 'https://api.openai.com/v1/images/generations',
      body: {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      },
    },
  ];

  for (const t of tries) {
    try {
      const res = await fetch(t.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(t.body),
        signal: AbortSignal.timeout(60_000),
      });
      const json = await res.json() as {
        data?: Array<{ b64_json?: string; url?: string }>;
        error?: { message?: string };
      };
      if (!res.ok) continue;
      const item = json.data?.[0];
      if (!item) continue;
      if (item.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      if (item.url) {
        // Fetch and convert to data URL so the site is self-contained
        const img = await fetch(item.url, { signal: AbortSignal.timeout(15_000) });
        if (!img.ok) continue;
        const buf = Buffer.from(await img.arrayBuffer());
        return `data:image/png;base64,${buf.toString('base64')}`;
      }
    } catch {
      // try next
    }
  }
  return null;
}
