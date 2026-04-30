'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';

const TPLS = [
  { n: 'SaaS Landing', c: 'saas', bg: 'linear-gradient(135deg,#1a0533,#0a1628)', ic: '#a78bfa', p: 'SaaS landing page with hero, pricing tiers, features, and testimonials' },
  { n: 'Startup', c: 'startup', bg: 'linear-gradient(135deg,#0a1628,#000)', ic: '#60a5fa', p: 'Startup landing page with waitlist form and early access' },
  { n: 'Portfolio', c: 'portfolio', bg: 'linear-gradient(135deg,#0f1729,#1a0533)', ic: '#818cf8', p: 'Personal portfolio with projects, skills, and contact form' },
  { n: 'E-commerce', c: 'ecommerce', bg: 'linear-gradient(135deg,#022c22,#064e3b)', ic: '#34d399', p: 'E-commerce store with product grid, cart, and checkout' },
  { n: 'Blog', c: 'blog', bg: 'linear-gradient(135deg,#431407,#92400e)', ic: '#fbbf24', p: 'Modern blog with articles, categories, and newsletter signup' },
  { n: 'Agency', c: 'saas', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', ic: '#a5b4fc', p: 'Agency website with services, team members, and case studies' },
  { n: 'Restaurant', c: 'startup', bg: 'linear-gradient(135deg,#450a0a,#7f1d1d)', ic: '#f87171', p: 'Restaurant site with menu, reservations form, and location' },
  { n: 'Dashboard', c: 'saas', bg: 'linear-gradient(135deg,#0c0a09,#1c1917)', ic: '#d4d4d4', p: 'Admin dashboard with analytics, KPI cards, and data tables' },
  { n: 'Podcast', c: 'blog', bg: 'linear-gradient(135deg,#0f172a,#1e1b4b)', ic: '#7dd3fc', p: 'Podcast site with episodes, audio player, and subscribe links' },
  { n: 'Photography', c: 'portfolio', bg: 'linear-gradient(135deg,#111827,#374151)', ic: '#e5e7eb', p: 'Photography portfolio with gallery and booking form' },
  { n: 'Event', c: 'startup', bg: 'linear-gradient(135deg,#1a0533,#4a044e)', ic: '#e879f9', p: 'Event page with schedule, speakers, and ticket purchase' },
  { n: 'Mobile App', c: 'saas', bg: 'linear-gradient(135deg,#0c1a3a,#1a0533)', ic: '#93c5fd', p: 'Mobile app landing with screenshots, features, and download links' },
];

const CATS = ['all', 'saas', 'ecommerce', 'portfolio', 'blog', 'startup'];

export function TemplatesClient() {
  const [cat, setCat] = useState('all');
  const router = useRouter();
  const list = cat === 'all' ? TPLS : TPLS.filter((t) => t.c === cat);

  function pick(prompt: string) {
    sessionStorage.setItem('szx_prompt', prompt);
    router.push('/dashboard');
  }

  return (
    <div className="px-8 py-11 max-w-[900px] mx-auto">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-[22px] font-bold tracking-tight">Templates</h1>
        <p className="text-[13px] text-white/55 mt-1">Start with a professionally designed template</p>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-5 animate-fade-up [animation-delay:80ms]">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              'px-3.5 py-1.5 rounded-full border text-[12.5px] font-medium capitalize transition-all ' +
              (cat === c
                ? 'bg-[rgba(109,40,217,0.15)] border-[rgba(109,40,217,0.4)] text-[#a78bfa]'
                : 'bg-transparent border-white/[0.07] text-white/55 hover:bg-white/[0.07] hover:text-white/85')
            }
          >
            {c === 'all' ? 'All' : c === 'saas' ? 'SaaS' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-up [animation-delay:160ms]">
        {list.map((t) => (
          <button
            key={t.n}
            onClick={() => pick(t.p)}
            className="group rounded-xl overflow-hidden border border-white/[0.07] cursor-pointer transition-all hover:border-white/[0.15] hover:-translate-y-0.5 bg-white/[0.03] text-left"
          >
            <div className="h-[118px] flex items-center justify-center relative overflow-hidden" style={{ background: t.bg }}>
              <Layers size={26} strokeWidth={1.5} style={{ color: t.ic }} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm transition-opacity">
                <span className="bg-white text-black text-[12.5px] font-semibold px-4 py-1.5 rounded-full">Use template</span>
              </div>
            </div>
            <div className="p-3.5">
              <div className="text-[13px] font-semibold text-white/85 mb-0.5">{t.n}</div>
              <div className="text-[11px] text-white/30 capitalize">{t.c}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
