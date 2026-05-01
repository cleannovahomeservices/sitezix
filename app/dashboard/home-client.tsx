'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Send, Loader2, Layers, User, ShoppingCart, FileText, BarChart3, Globe, Zap, Copy, Download, ExternalLink, Sparkles, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/toast';

const TEMPLATES = [
  { name: 'SaaS Landing', desc: 'Hero, pricing & CTA', icon: Layers, color: '#a78bfa', bg: 'rgba(109,40,217,0.18)', prompt: 'SaaS landing page with hero section, pricing tiers, features grid, and customer testimonials' },
  { name: 'Portfolio', desc: 'Personal showcase', icon: User, color: '#60a5fa', bg: 'rgba(59,130,246,0.18)', prompt: 'Personal portfolio website with about section, project showcase, skills, and contact form' },
  { name: 'E-commerce', desc: 'Shop & checkout', icon: ShoppingCart, color: '#34d399', bg: 'rgba(16,185,129,0.16)', prompt: 'E-commerce store with product catalog, shopping cart, and checkout flow' },
  { name: 'Blog', desc: 'Articles & content', icon: FileText, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', prompt: 'Modern blog with article listing, categories, search, and newsletter signup' },
  { name: 'Dashboard', desc: 'Analytics & data', icon: BarChart3, color: '#f472b6', bg: 'rgba(236,72,153,0.15)', prompt: 'Admin dashboard with charts, KPI cards, data tables, and sidebar navigation' },
  { name: 'Agency', desc: 'Services & team', icon: Globe, color: '#818cf8', bg: 'rgba(99,102,241,0.18)', prompt: 'Creative agency website with services, team members, case studies, and contact' },
  { name: 'Startup', desc: 'Launch & waitlist', icon: Zap, color: '#f87171', bg: 'rgba(239,68,68,0.14)', prompt: 'Startup landing page with waitlist signup, hero, features, and early access form' },
];

const PHRASES = ["Let's build something", "What will you create", "Your idea, live in seconds"];

const PROGRESS_STEPS = [
  'Analyzing your request...',
  'Building structure...',
  'Designing & polishing...',
  'Almost ready...',
];

type GenerationResult = {
  projectId: string;
  html: string;
  previewUrl?: string;
};

type ChatMsg = {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
};

export function HomeClient({ userName, credits: initialCredits }: { userName: string; credits: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [pills, setPills] = useState({ login: false, payments: false, deploy: false });
  const [credits, setCredits] = useState(initialCredits);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [deploying, setDeploying] = useState(false);

  // Chat state for edits
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [editInput, setEditInput] = useState('');
  const [editing, setEditing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Pull prompt from templates page if set
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('szx_prompt') : null;
    if (stored) {
      setPrompt(stored);
      sessionStorage.removeItem('szx_prompt');
      setTimeout(() => taRef.current?.focus(), 50);
    }
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chat]);

  // Typing headline
  const [hl, setHl] = useState('');
  const idxRef = useRef({ p: 0, c: 0, dir: 1 });
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHl(`${PHRASES[0]}, ${userName}.`);
      return;
    }
    const t = setInterval(() => {
      const ref = idxRef.current;
      const phrase = `${PHRASES[ref.p]}, ${userName}.`;
      ref.c += ref.dir;
      setHl(phrase.slice(0, ref.c));
      if (ref.c === phrase.length) { ref.dir = 0; setTimeout(() => { ref.dir = -1; }, 2200); }
      else if (ref.c === 0 && ref.dir === -1) { ref.p = (ref.p + 1) % PHRASES.length; ref.dir = 1; }
    }, 50);
    return () => clearInterval(t);
  }, [userName]);

  const taRef = useRef<HTMLTextAreaElement>(null);
  function autosize() {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }

  function applyTemplate(p: string) {
    setPrompt(p);
    setTimeout(autosize, 0);
    taRef.current?.focus();
  }

  async function handleGenerate() {
    const value = prompt.trim();
    if (!value) { taRef.current?.focus(); return; }
    if (credits < 1) { toast('No credits left — upgrade to keep building.'); return; }

    setGenerating(true);
    setResult(null);
    setProgressStep(1);
    setProgressMessage(PROGRESS_STEPS[0]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value, features: pills }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Generation failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalProjectId = '';
      let finalHtml = '';
      let streamError = '';

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === 'progress') {
              setProgressStep(evt.step);
              setProgressMessage(evt.message);
            } else if (evt.type === 'complete') {
              finalProjectId = evt.projectId;
              finalHtml = evt.html;
            } else if (evt.type === 'error') {
              streamError = evt.error || 'Generation failed';
            }
          } catch {
            // skip malformed line
          }
        }
      }

      if (streamError) throw new Error(streamError);
      if (!finalHtml || !finalProjectId) throw new Error('Generation produced no HTML');

      setResult({ projectId: finalProjectId, html: finalHtml });
      setChat([
        { role: 'user', content: value },
        { role: 'assistant', content: 'Your site is ready. Tell me what you want to change.' },
      ]);
      setCredits((c) => Math.max(c - 1, 0));
      toast('Site generated!');

      if (pills.deploy) autoDeploy(finalProjectId);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setGenerating(false);
      setProgressStep(0);
      setProgressMessage('');
    }
  }

  async function autoDeploy(projectId: string) {
    setDeploying(true);
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Deploy failed');
      setResult((r) => (r ? { ...r, previewUrl: j.url } : r));
      toast('Deployed live!');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Deploy failed');
    } finally {
      setDeploying(false);
    }
  }

  async function sendEdit() {
    const value = editInput.trim();
    if (!value || !result || editing) return;
    if (credits < 1) { toast('No credits left — upgrade to keep editing.'); return; }

    setEditing(true);
    setEditInput('');
    setChat((c) => [...c, { role: 'user', content: value }, { role: 'assistant', content: 'Applying your changes…', pending: true }]);

    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: result.projectId, message: value }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Edit failed');

      setResult((r) => (r ? { ...r, html: j.html } : r));
      setChat((c) => {
        const next = [...c];
        // replace last pending placeholder
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].pending) { next[i] = { role: 'assistant', content: 'Done — preview updated.' }; break; }
        }
        return next;
      });
      setCredits((c) => Math.max(c - 1, 0));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Edit failed';
      setChat((c) => {
        const next = [...c];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].pending) { next[i] = { role: 'assistant', content: `Couldn't apply that: ${msg}` }; break; }
        }
        return next;
      });
      toast(msg);
    } finally {
      setEditing(false);
    }
  }

  function downloadHtml() {
    if (!result) return;
    const blob = new Blob([result.html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitezix-project.html';
    a.click();
    toast('Downloaded');
  }

  function copyCode() {
    if (!result) return;
    navigator.clipboard?.writeText(result.html);
    toast('Code copied');
  }

  function startNew() {
    setResult(null);
    setChat([]);
    setEditInput('');
    setPrompt('');
    setPills({ login: false, payments: false, deploy: false });
    router.refresh();
  }

  // ── RESULT VIEW (chat left + iframe right) ──
  if (result) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-7 py-4 border-b border-white/[0.07] backdrop-blur-sm bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[13px] font-medium">Live preview</span>
            {result.previewUrl && (
              <a href={result.previewUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[12.5px] text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1">
                {result.previewUrl.replace(/^https?:\/\//, '')}
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!result.previewUrl && (
              <button
                onClick={() => autoDeploy(result.projectId)}
                disabled={deploying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
              >
                {deploying ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {deploying ? 'Deploying…' : 'Deploy live'}
              </button>
            )}
            <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[12.5px] font-medium border border-white/10 transition-colors"><Copy size={12} />Copy</button>
            <button onClick={downloadHtml} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[12.5px] font-medium border border-white/10 transition-colors"><Download size={12} />Download</button>
            <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 text-[12.5px] font-semibold transition-colors"><Plus size={12} />New</button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Chat panel */}
          <aside className="w-[360px] shrink-0 border-r border-white/[0.07] flex flex-col bg-black/40">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.07]">
              <MessageSquare size={14} className="text-white/60" />
              <span className="text-[12.5px] font-semibold text-white/85">Edit with chat</span>
              <span className="ml-auto text-[10.5px] text-white/35">1 credit per edit</span>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'ml-auto max-w-[85%] bg-white text-black text-[13px] leading-relaxed rounded-2xl rounded-br-md px-3.5 py-2 shadow-sm'
                      : 'mr-auto max-w-[90%] bg-white/[0.06] border border-white/[0.08] text-white/85 text-[13px] leading-relaxed rounded-2xl rounded-bl-md px-3.5 py-2'
                  }
                >
                  {m.pending ? (
                    <span className="flex items-center gap-2 text-white/60">
                      <Loader2 size={12} className="animate-spin" /> {m.content}
                    </span>
                  ) : (
                    m.content
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.07] p-3">
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-white/20 transition-colors">
                <textarea
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); sendEdit(); }
                    else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendEdit(); }
                  }}
                  placeholder='e.g. "Make the hero bigger" or "Change color to green"'
                  rows={2}
                  className="w-full bg-transparent border-0 outline-none text-[13px] text-white placeholder:text-white/30 px-3 pt-2.5 pb-1 resize-none leading-snug"
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-[10.5px] text-white/30 px-1">Enter to send · Shift+Enter for newline</span>
                  <button
                    onClick={sendEdit}
                    disabled={editing || !editInput.trim() || credits < 1}
                    className="w-[28px] h-[28px] rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Iframe */}
          <div className="flex-1 min-w-0 relative">
            <iframe
              srcDoc={result.html}
              className="absolute inset-0 w-full h-full bg-white"
              title="Generated site preview"
              sandbox="allow-scripts"
            />
            {editing && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[12px] text-white/90">
                <Loader2 size={12} className="animate-spin" /> Updating…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME VIEW ──
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 py-10">
      <div className="relative z-10 w-full max-w-[660px] flex flex-col items-center gap-7">

        <h1 className="text-[clamp(28px,4vw,46px)] font-normal tracking-tight text-white text-center leading-[1.15] min-h-[1.2em] animate-fade-up">
          {hl}
          <span className="inline-block w-[2px] h-[0.85em] bg-white/70 ml-[2px] align-middle animate-blink" aria-hidden="true" />
        </h1>

        {/* Input card */}
        <div
          className="w-full rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.97)] transition-all"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)' }}
        >
          <textarea
            ref={taRef}
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); autosize(); }}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleGenerate(); } }}
            placeholder="Describe the website you want to build..."
            className="w-full px-5 pt-[18px] pb-2 bg-transparent border-0 outline-none text-[14.5px] text-[#111] resize-none leading-[1.6] min-h-[72px] font-jakarta placeholder:text-black/30"
            rows={2}
            disabled={generating}
          />
          <div className="flex items-center gap-1.5 px-3.5 pt-2 pb-3.5">
            <button className="w-[30px] h-[30px] rounded-md border-[1.5px] border-black/[0.12] flex items-center justify-center text-black/40 hover:bg-black/[0.05] hover:border-black/[0.22] hover:text-black/70 transition-colors shrink-0">
              <Plus size={14} strokeWidth={2.2} />
            </button>
            <div className="w-px h-[18px] bg-black/10 shrink-0" />
            <div className="flex gap-1.5 flex-1">
              {(['login','payments','deploy'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPills((p) => ({ ...p, [k]: !p[k] }))}
                  className={
                    'inline-flex items-center gap-1.5 px-[11px] py-[3px] rounded-full border-[1.5px] text-[11.5px] font-medium transition-all whitespace-nowrap select-none ' +
                    (pills[k] ? 'bg-[#111] border-[#111] text-white' : 'bg-black/[0.03] border-black/10 text-black/50 hover:bg-black/[0.07] hover:border-black/20 hover:text-black/75')
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || credits < 1}
              className="w-[34px] h-[34px] rounded-full bg-[#111] hover:bg-[#2d2d2d] active:scale-95 transition-all flex items-center justify-center ml-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        {generating && (
          <div className="w-full max-w-[660px] -mt-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <Loader2 size={14} className="text-white/70 animate-spin shrink-0" />
              <span className="text-[13px] text-white/85 flex-1">{progressMessage || PROGRESS_STEPS[0]}</span>
              <span className="text-[11px] text-white/35 tabular-nums">{Math.max(progressStep, 1)}/4</span>
            </div>
            <div className="mt-2 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progressStep, 4) * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* Templates strip */}
        {!generating && (
          <div className="w-full max-w-[800px]">
            <div className="text-[10.5px] font-semibold tracking-[0.07em] text-white/24 uppercase mb-3 px-0.5">Quick start</div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.name}
                    onClick={() => applyTemplate(t.prompt)}
                    className="shrink-0 w-[155px] p-3.5 rounded-[11px] bg-white/[0.04] border border-white/[0.07] cursor-pointer text-left transition-all hover:bg-white/[0.07] hover:border-white/[0.13] hover:-translate-y-0.5"
                  >
                    <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center mb-2.5" style={{ background: t.bg }}>
                      <Icon size={15} color={t.color} strokeWidth={2} />
                    </div>
                    <div className="text-[12.5px] font-semibold text-white/85 mb-0.5">{t.name}</div>
                    <div className="text-[11px] text-white/30 leading-[1.4]">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-[11px] text-white/30 -mt-2">
          {credits} credit{credits === 1 ? '' : 's'} remaining
        </div>
      </div>
    </div>
  );
}
