'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, Settings, Sparkles, Gift, LogOut, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './toast';

type Profile = { full_name: string | null; email: string | null; credits: number; plan: string };

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/auth/login');
    router.refresh();
  }

  function copyReferral() {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/register?ref=you';
    navigator.clipboard?.writeText(url).catch(() => {});
    toast('Referral link copied!');
  }

  const items = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/projects', label: 'My Projects', icon: LayoutGrid },
    { href: '/dashboard/templates', label: 'Templates', icon: FolderOpen },
  ];

  return (
    <aside className="w-[220px] min-w-[220px] bg-[#0f0f0f] border-r border-white/[0.07] flex flex-col z-20 relative">
      {/* Logo */}
      <div className="px-[18px] py-5 border-b border-white/[0.07]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-transform group-hover:rotate-[15deg]"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="white"><path d="M7.5 1.5L13 4.75V11.25L7.5 14.5L2 11.25V4.75L7.5 1.5Z"/></svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Sitezix</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-normal transition-colors relative',
                active ? 'bg-white/[0.08] text-white' : 'text-white/50 hover:bg-white/[0.06] hover:text-white/85'
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-r-sm"
                  style={{ background: 'linear-gradient(to bottom,#6d28d9,#3b82f6)' }}
                />
              )}
              <Icon size={15} className={cn('shrink-0 transition-opacity', active ? 'opacity-100' : 'opacity-60 group-hover:opacity-90')} />
              {it.label}
            </Link>
          );
        })}

        <div className="h-px bg-white/[0.07] my-1.5 mx-2.5" />

        <Link
          href="/dashboard/settings"
          className={cn(
            'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-normal transition-colors relative',
            pathname === '/dashboard/settings'
              ? 'bg-white/[0.08] text-white'
              : 'text-white/50 hover:bg-white/[0.06] hover:text-white/85'
          )}
        >
          {pathname === '/dashboard/settings' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-r-sm" style={{ background: 'linear-gradient(to bottom,#6d28d9,#3b82f6)' }} />
          )}
          <Settings size={15} className="shrink-0 opacity-60 group-hover:opacity-90" />
          Settings
        </Link>
      </nav>

      {/* Bottom: credits + buttons */}
      <div className="p-2.5 pb-4 border-t border-white/[0.07] flex flex-col gap-1.5">
        <div className="px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] mb-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Credits</span>
            <span className="text-[12.5px] font-semibold text-white">{profile.credits}</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.min((profile.credits / 10) * 100, 100)}%`, background: 'linear-gradient(90deg,#6d28d9,#3b82f6)' }} />
          </div>
        </div>

        <button
          onClick={copyReferral}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-white/50 text-[12.5px] font-normal border border-white/[0.07] bg-transparent hover:bg-white/[0.05] hover:text-white/80 hover:border-white/[0.14] transition-colors"
        >
          <Gift size={13} />
          Refer a friend
        </button>

        <button
          className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg cursor-pointer text-white text-[12.5px] font-semibold border-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
        >
          <Sparkles size={12} />
          Upgrade to Pro
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2.5 py-2 mt-1 rounded-lg cursor-pointer text-white/40 text-[12px] font-normal hover:bg-white/[0.05] hover:text-white/70 transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
