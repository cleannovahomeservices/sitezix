'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Trash2, Copy, Download, Sparkles, Loader2, PowerOff } from 'lucide-react';
import { useToast } from '@/components/toast';

type Project = {
  id: string;
  name: string;
  prompt: string | null;
  generated_code: string | null;
  preview_url: string | null;
  status: string;
  has_login: boolean;
  has_payments: boolean;
  has_deploy: boolean;
  created_at: string;
};

export function PreviewClient({ project }: { project: Project }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deploying, setDeploying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(project.preview_url);
  const [status, setStatus] = useState<string>(project.status);

  async function deploy() {
    setDeploying(true);
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Deploy failed');
      setPreviewUrl(j.url);
      setStatus('live');
      toast('Deployed live!');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Deploy failed');
    } finally {
      setDeploying(false);
    }
  }

  async function unpublish() {
    if (!confirm('Take this site offline? It will be removed from Vercel but kept here as a draft.')) return;
    setUnpublishing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/take-offline`, { method: 'POST' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Failed');
      setPreviewUrl(null);
      setStatus('draft');
      toast('Site taken offline.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to take offline');
    } finally {
      setUnpublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this project permanently? This will also remove the live deployment from Vercel.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      toast('Project deleted.');
      router.push('/dashboard/projects');
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed');
      setDeleting(false);
    }
  }

  function copyCode() {
    if (!project.generated_code) return;
    navigator.clipboard?.writeText(project.generated_code);
    toast('Code copied');
  }

  function downloadHtml() {
    if (!project.generated_code) return;
    const blob = new Blob([project.generated_code], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name || 'site'}.html`;
    a.click();
    toast('Downloaded');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.07] backdrop-blur-sm bg-black/30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 hover:text-white text-[12.5px] font-medium border border-white/10 transition-colors"
          >
            <ArrowLeft size={12} />
            Back
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={
                'shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ' +
                (status === 'live'
                  ? 'bg-emerald-500/[0.12] border-emerald-500/20 text-emerald-400'
                  : 'bg-white/[0.06] border-white/[0.07] text-white/55')
              }
            >
              {status === 'live' ? (
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</span>
              ) : 'Draft'}
            </span>
            <span className="text-[13px] font-medium truncate">{project.name}</span>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[12px] text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1 truncate"
              >
                {previewUrl.replace(/^https?:\/\//, '')}
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!previewUrl ? (
            <button
              onClick={deploy}
              disabled={deploying || !project.generated_code}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
            >
              {deploying ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {deploying ? 'Deploying…' : 'Deploy live'}
            </button>
          ) : (
            <button
              onClick={unpublish}
              disabled={unpublishing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-amber-500/15 text-amber-300 text-[12.5px] font-semibold border border-amber-500/20 transition-colors disabled:opacity-50"
              title="Remove the live deployment from Vercel"
            >
              {unpublishing ? <Loader2 size={12} className="animate-spin" /> : <PowerOff size={12} />}
              {unpublishing ? 'Taking offline…' : 'Take offline'}
            </button>
          )}
          <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[12.5px] font-medium border border-white/10 transition-colors">
            <Copy size={12} />Copy
          </button>
          <button onClick={downloadHtml} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[12.5px] font-medium border border-white/10 transition-colors">
            <Download size={12} />Download
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/[0.12] hover:bg-red-500/25 text-red-300 hover:text-red-200 text-[12.5px] font-semibold border border-red-500/25 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-white">
        {project.generated_code ? (
          <iframe
            srcDoc={project.generated_code}
            className="absolute inset-0 w-full h-full"
            title={`${project.name} preview`}
            sandbox="allow-scripts"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No code generated for this project yet.
          </div>
        )}
      </div>
    </div>
  );
}
