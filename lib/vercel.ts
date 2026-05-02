// Vercel API helpers: derive project names + delete deployments.

const VERCEL_TEAM_ID = 'team_BRMbfowgg5bBAnRH1NAts5xr';

export function projectSlug(name: string | null | undefined, projectId: string): string {
  const base = (name || 'sitezix-app')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'sitezix-app';
  return `${base}-${projectId.slice(0, 6)}`;
}

export async function deleteVercelProject(name: string): Promise<{ ok: boolean; status: number; error?: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { ok: false, status: 0, error: 'No VERCEL_API_TOKEN' };
  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(name)}?teamId=${VERCEL_TEAM_ID}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.ok || res.status === 404) {
      return { ok: true, status: res.status };
    }
    let msg = 'Vercel delete failed';
    try {
      const j = await res.json() as { error?: { message?: string } };
      msg = j.error?.message || msg;
    } catch {}
    return { ok: false, status: res.status, error: msg };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : 'network error' };
  }
}
