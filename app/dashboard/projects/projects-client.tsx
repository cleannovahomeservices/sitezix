'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, ExternalLink, Trash2, Lock, CreditCard, Rocket, Eye } from 'lucide-react';
import { useToast } from '@/components/toast';

type Project = {
  id: string;
  name: string;
  prompt: string | null;
  preview_url: string | null;
  has_login: boolean;
  has_payments: boolean;
  has_deploy: boolean;
  status: string;
  created_at: string;
};

const COLORS = ['#7c3aed', '#3b82f6', '#059669', '#db2777', '#d97706', '#dc2626'];

export function ProjectsClient({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [q, setQ] = useState('');
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const filtered = projects.filter((p) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.prompt || '').toLowerCase().includes(q.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm('Delete this project permanently? If it was deployed, it will also be removed from Vercel.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Delete failed');
      setProjects((p) => p.filter((x) => x.id !== id));
      startTransition(() => router.refresh());
      toast('Project deleted');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <div className="px-8 py-11 max-w-[900px] mx-auto">

      <div className="flex items-start justify-between mb-7 gap-4 animate-fade-up">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">My Projects</h1>
          <p className="text-[13px] text-white/55 mt-1">All your generated websites</p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
        >
          <Plus size={13} strokeWidth={2.5} />
          New project
        </Link>
      </div>

      <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.07] rounded-[10px] px-3.5 py-2.5 mb-5 focus-within:border-[rgba(109,40,217,0.35)] focus-within:bg-white/[0.07] transition-colors animate-fade-up [animation-delay:80ms]">
        <Search size={15} className="text-white/30" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="flex-1 bg-transparent border-0 outline-none text-[13.5px] text-white placeholder:text-white/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 opacity-50 animate-fade-up [animation-delay:160ms]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
            <Plus size={20} className="text-white/30" />
          </div>
          <div className="text-[15px] font-medium text-white/55">No projects yet</div>
          <div className="text-[13px] text-white/30 text-center">Describe a website on the Home page and it&apos;ll show up here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-up [animation-delay:160ms]">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} color={COLORS[i % COLORS.length]} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, color, onDelete }: { project: Project; color: string; onDelete: (id: string) => void }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group block bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 transition-all hover:bg-white/[0.07] hover:border-white/[0.12] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base font-bold text-white shrink-0"
          style={{ background: `${color}22`, color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className="w-7 h-7 rounded-md bg-white/[0.08] text-white/60 flex items-center justify-center"
            title="Preview"
          >
            <Eye size={12} />
          </span>
          {project.preview_url && (
            <a
              href={project.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-md bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white flex items-center justify-center transition-colors"
              title="Open live site"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }}
            className="w-7 h-7 rounded-md bg-white/[0.08] hover:bg-red-500/20 text-white/60 hover:text-red-400 flex items-center justify-center transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="text-[14px] font-semibold mb-1 truncate">{project.name}</div>
      <div className="text-[11.5px] text-white/30 truncate mb-2.5">
        {project.preview_url ? project.preview_url.replace(/^https?:\/\//, '') : 'Click to preview'}
      </div>
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        {project.has_login && (<Badge icon={Lock} label="Login" />)}
        {project.has_payments && (<Badge icon={CreditCard} label="Payments" />)}
        {project.has_deploy && (<Badge icon={Rocket} label="Deploy" />)}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-white/30">{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <span className={
          'text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ' +
          (project.status === 'live'
            ? 'bg-emerald-500/[0.12] border-emerald-500/20 text-emerald-400'
            : 'bg-white/[0.06] border-white/[0.07] text-white/55')
        }>
          {project.status}
        </span>
      </div>
    </Link>
  );
}

function Badge({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.07] text-[10px] text-white/60 font-medium">
      <Icon size={9} />
      {label}
    </span>
  );
}
