-- ── Profiles ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'free',
  credits integer default 10,
  created_at timestamptz default now()
);

-- ── Projects ─────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  prompt text,
  generated_code text,
  preview_url text,
  has_login boolean default false,
  has_payments boolean default false,
  has_deploy boolean default false,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

-- ── Chat history ─────────────────────────────────────────
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists chat_history_user_id_idx on public.chat_history(user_id);
create index if not exists chat_history_project_id_idx on public.chat_history(project_id);

-- ── RLS ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.chat_history enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "projects own read" on public.projects;
create policy "projects own read" on public.projects for select using (auth.uid() = user_id);

drop policy if exists "projects own write" on public.projects;
create policy "projects own write" on public.projects for insert with check (auth.uid() = user_id);

drop policy if exists "projects own update" on public.projects;
create policy "projects own update" on public.projects for update using (auth.uid() = user_id);

drop policy if exists "projects own delete" on public.projects;
create policy "projects own delete" on public.projects for delete using (auth.uid() = user_id);

drop policy if exists "chat own read" on public.chat_history;
create policy "chat own read" on public.chat_history for select using (auth.uid() = user_id);

drop policy if exists "chat own write" on public.chat_history;
create policy "chat own write" on public.chat_history for insert with check (auth.uid() = user_id);

-- ── Trigger: insert profile on signup ────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Trigger: keep updated_at fresh on projects ───────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();
