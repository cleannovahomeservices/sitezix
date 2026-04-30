'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/toast';

export function SettingsClient({
  initialName, email, avatarUrl, plan, credits,
}: {
  initialName: string; email: string; avatarUrl: string | null; plan: string; credits: number;
}) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), avatar_url: avatar.trim() || null })
      .eq('email', email);
    setSaving(false);
    if (error) { toast(error.message); return; }
    toast('Profile saved');
    router.refresh();
  }

  const initial = (name || email || 'S').charAt(0).toUpperCase();

  return (
    <div className="px-8 py-11 max-w-[680px] mx-auto">
      <div className="mb-7 animate-fade-up">
        <h1 className="text-[22px] font-bold tracking-tight">Settings</h1>
        <p className="text-[13px] text-white/55 mt-1">Manage your profile, plan, and account</p>
      </div>

      {/* Profile */}
      <section className="mb-6 animate-fade-up [animation-delay:80ms]">
        <h2 className="text-[15px] font-semibold mb-3">Profile</h2>
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-4 border-b border-white/[0.07]">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
            >
              {!avatar && initial}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium">Avatar</div>
              <div className="text-[12px] text-white/55">Generated from your name, or paste a URL below</div>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-white/[0.07]">
            <label className="block text-[13px] font-medium mb-1.5" htmlFor="name">Display name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-[#7c3aed]/50 focus:bg-white/[0.08] transition-colors"
              placeholder="Your name"
            />
          </div>

          <div className="px-4 py-4 border-b border-white/[0.07]">
            <label className="block text-[13px] font-medium mb-1.5" htmlFor="avatar">Avatar URL</label>
            <input
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13.5px] text-white outline-none focus:border-[#7c3aed]/50 focus:bg-white/[0.08] transition-colors"
              placeholder="https://…"
            />
          </div>

          <div className="px-4 py-4">
            <label className="block text-[13px] font-medium mb-1.5">Email</label>
            <input
              value={email}
              disabled
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13.5px] text-white/50 outline-none cursor-not-allowed"
            />
            <div className="text-[11.5px] text-white/30 mt-1.5">Contact support to change your email.</div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-[13px] font-semibold transition-opacity disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
        >
          <Check size={13} strokeWidth={2.5} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </section>

      {/* Plan */}
      <section className="animate-fade-up [animation-delay:160ms]">
        <h2 className="text-[15px] font-semibold mb-3">Plan & credits</h2>
        <div className="rounded-xl overflow-hidden border" style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.08),rgba(59,130,246,0.08))', borderColor: 'rgba(109,40,217,0.2)' }}>
          <div className="flex items-start justify-between gap-4 px-4 py-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold capitalize">{plan} Plan</span>
                <span className="text-[10.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.07] text-white/55">Current</span>
              </div>
              <div className="text-[12px] text-white/55">{credits} credits remaining · 1 credit = 1 generation</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden max-w-[280px]">
                <div className="h-full rounded-full" style={{ width: `${Math.min((credits / 10) * 100, 100)}%`, background: 'linear-gradient(90deg,#6d28d9,#3b82f6)' }} />
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[12.5px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
            >
              <Sparkles size={12} />
              Upgrade
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
