// Image search via Unsplash with Pexels fallback.
// Returns a real, hi-quality image URL for a search query.

type Orientation = 'landscape' | 'portrait' | 'squarish';

async function searchUnsplash(query: string, orientation: Orientation): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      // small timeout via AbortController
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { results?: Array<{ urls?: { regular?: string } }> };
    const results = json.results || [];
    if (!results.length) return null;
    // Pick a random one from the top 5 to avoid same image across many sites
    const pick = results[Math.floor(Math.random() * Math.min(results.length, 5))];
    return pick?.urls?.regular || null;
  } catch {
    return null;
  }
}

async function searchPexels(query: string, orientation: Orientation): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const pexelsOrientation = orientation === 'squarish' ? 'square' : orientation;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${pexelsOrientation}`;
    const res = await fetch(url, {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { photos?: Array<{ src?: { large2x?: string; large?: string } }> };
    const photos = json.photos || [];
    if (!photos.length) return null;
    const pick = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
    return pick?.src?.large2x || pick?.src?.large || null;
  } catch {
    return null;
  }
}

export async function findImage(query: string, orientation: Orientation = 'landscape'): Promise<string> {
  const cleaned = query.replace(/[^\w\s,]/g, ' ').replace(/\s+/g, ' ').trim() || 'business';
  const fromUnsplash = await searchUnsplash(cleaned, orientation);
  if (fromUnsplash) return fromUnsplash;
  const fromPexels = await searchPexels(cleaned, orientation);
  if (fromPexels) return fromPexels;
  // Final fallback: a neutral gradient placeholder
  return `https://placehold.co/1200x800/e5e7eb/9ca3af?text=${encodeURIComponent(cleaned.slice(0, 30))}`;
}

// Replace IMG:keyword,keyword2 placeholders in HTML with real image URLs.
// Pattern: src="IMG:office,modern" or src="IMG:office modern"
export async function replaceImagePlaceholders(html: string): Promise<string> {
  const pattern = /src=["']IMG:([^"']+)["']/g;
  const matches: { full: string; query: string; orientation: Orientation }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    const raw = m[1].trim();
    // Allow optional |portrait or |squarish suffix
    let orientation: Orientation = 'landscape';
    let query = raw;
    const pipe = raw.lastIndexOf('|');
    if (pipe > 0) {
      const o = raw.slice(pipe + 1).trim();
      if (o === 'portrait' || o === 'squarish' || o === 'landscape') orientation = o;
      query = raw.slice(0, pipe);
    }
    query = query.replace(/,/g, ' ');
    matches.push({ full: m[0], query, orientation });
  }
  if (!matches.length) return html;

  // Dedupe by full match to fetch unique queries only once
  const unique = Array.from(new Map(matches.map((x) => [x.full, x])).values());
  const resolved = await Promise.all(unique.map(async (x) => {
    const url = await findImage(x.query, x.orientation);
    return [x.full, url] as const;
  }));
  const map = new Map(resolved);

  return html.replace(pattern, (full) => {
    const url = map.get(full);
    return url ? `src="${url}"` : full;
  });
}
