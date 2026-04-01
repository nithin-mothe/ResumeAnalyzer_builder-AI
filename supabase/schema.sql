create extension if not exists "pgcrypto";

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.resumes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    title text not null,
    content jsonb not null,
    storage_path text,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analysis_results (
    id uuid primary key default gen_random_uuid(),
    resume_id uuid not null references public.resumes(id) on delete cascade,
    score integer not null check (score >= 0 and score <= 100),
    suggestions jsonb not null default '[]'::jsonb,
    problems jsonb not null default '[]'::jsonb,
    strengths jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists analysis_results_resume_id_idx on public.analysis_results(resume_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users (id, email)
    values (new.id, coalesce(new.email, 'unknown@example.com'))
    on conflict (id) do update
    set email = excluded.email;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.analysis_results enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
for update using (auth.uid() = id);

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own" on public.resumes
for select using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own" on public.resumes
for insert with check (auth.uid() = user_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own" on public.resumes
for update using (auth.uid() = user_id);

drop policy if exists "analysis_select_own" on public.analysis_results;
create policy "analysis_select_own" on public.analysis_results
for select using (
    exists (
        select 1 from public.resumes r
        where r.id = analysis_results.resume_id and r.user_id = auth.uid()
    )
);

drop policy if exists "analysis_insert_own" on public.analysis_results;
create policy "analysis_insert_own" on public.analysis_results
for insert with check (
    exists (
        select 1 from public.resumes r
        where r.id = analysis_results.resume_id and r.user_id = auth.uid()
    )
);

insert into storage.buckets (id, name, public)
values ('resume-files', 'resume-files', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own_resume_files" on storage.objects;
create policy "storage_select_own_resume_files" on storage.objects
for select using (
    bucket_id = 'resume-files'
    and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_insert_own_resume_files" on storage.objects;
create policy "storage_insert_own_resume_files" on storage.objects
for insert with check (
    bucket_id = 'resume-files'
    and auth.uid()::text = (storage.foldername(name))[1]
);
