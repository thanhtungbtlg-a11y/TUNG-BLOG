-- Supabase comments with anonymous submission and admin moderation.
-- Run this file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.blog_comments (
	id uuid primary key default gen_random_uuid(),
	slug text not null,
	body text not null,
	status text not null default 'pending',
	created_at timestamptz not null default now(),
	approved_at timestamptz,
	approved_by uuid references auth.users(id) on delete set null,
	constraint blog_comments_status_check check (status in ('pending', 'approved')),
	constraint blog_comments_body_length_check check (
		char_length(btrim(body)) between 1 and 600
	),
	constraint blog_comments_slug_length_check check (
		char_length(btrim(slug)) between 1 and 180
	)
);

create index if not exists blog_comments_slug_status_created_idx
	on public.blog_comments (slug, status, created_at desc);

create table if not exists public.comment_admins (
	user_id uuid primary key references auth.users(id) on delete cascade,
	email text,
	created_at timestamptz not null default now()
);

create or replace function public.is_comment_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.comment_admins
		where user_id = auth.uid()
	);
$$;

grant execute on function public.is_comment_admin() to authenticated;

alter table public.blog_comments enable row level security;
alter table public.comment_admins enable row level security;

drop policy if exists "Anyone can read approved comments" on public.blog_comments;
create policy "Anyone can read approved comments"
	on public.blog_comments
	for select
	to anon, authenticated
	using (status = 'approved');

drop policy if exists "Admins can read all comments" on public.blog_comments;
create policy "Admins can read all comments"
	on public.blog_comments
	for select
	to authenticated
	using (public.is_comment_admin());

drop policy if exists "Anyone can submit pending comments" on public.blog_comments;
create policy "Anyone can submit pending comments"
	on public.blog_comments
	for insert
	to anon, authenticated
	with check (
		status = 'pending'
		and char_length(btrim(body)) between 1 and 600
		and char_length(btrim(slug)) between 1 and 180
	);

drop policy if exists "Admins can update comments" on public.blog_comments;
create policy "Admins can update comments"
	on public.blog_comments
	for update
	to authenticated
	using (public.is_comment_admin())
	with check (public.is_comment_admin());

drop policy if exists "Admins can delete comments" on public.blog_comments;
create policy "Admins can delete comments"
	on public.blog_comments
	for delete
	to authenticated
	using (public.is_comment_admin());

drop policy if exists "Admins can read admin records" on public.comment_admins;
create policy "Admins can read admin records"
	on public.comment_admins
	for select
	to authenticated
	using (public.is_comment_admin() or user_id = auth.uid());

-- After creating your Supabase Auth admin user, run this once:
-- insert into public.comment_admins (user_id, email)
-- select id, email from auth.users where email = 'your-admin-email@example.com'
-- on conflict (user_id) do update set email = excluded.email;
