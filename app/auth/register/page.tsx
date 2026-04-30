'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (data.user && !data.session) {
      setInfo('Check your inbox to confirm your email.');
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-2 animate-d2" />
        <div className="orb orb-3 animate-d3" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}>
            <svg width="18" height="18" viewBox="0 0 15 15" fill="white"><path d="M7.5 1.5L13 4.75V11.25L7.5 14.5L2 11.25V4.75L7.5 1.5Z"/></svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">Sitezix</span>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-center mb-2">Create your account</h1>
        <p className="text-sm text-white/50 text-center mb-7">Start building in seconds — free to begin</p>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-white text-black text-[13.5px] font-semibold hover:bg-white/90 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] text-white/40 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-white/70 mb-1.5" htmlFor="name">Full name</label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-[13.5px] outline-none focus:border-[#7c3aed]/50 focus:bg-white/[0.06] transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-white/70 mb-1.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-[13.5px] outline-none focus:border-[#7c3aed]/50 focus:bg-white/[0.06] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-white/70 mb-1.5" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-[13.5px] outline-none focus:border-[#7c3aed]/50 focus:bg-white/[0.06] transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {err && <div className="text-[12.5px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</div>}
          {info && <div className="text-[12.5px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{info}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white text-[13.5px] font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#3b82f6)' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[12.5px] text-white/50 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#a78bfa] hover:text-[#c4b5fd] font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
