-- Supabase blog interactions with anonymous submission and admin moderation.
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

create table if not exists public.post_reaction_counts (
	slug text primary key,
	like_count integer not null default 0 check (like_count >= 0),
	love_count integer not null default 0 check (love_count >= 0),
	haha_count integer not null default 0 check (haha_count >= 0),
	wow_count integer not null default 0 check (wow_count >= 0),
	sad_count integer not null default 0 check (sad_count >= 0),
	angry_count integer not null default 0 check (angry_count >= 0),
	updated_at timestamptz not null default now(),
	constraint post_reaction_counts_slug_length_check check (
		char_length(btrim(slug)) between 1 and 180
	)
);

alter table public.post_reaction_counts
	add column if not exists love_count integer not null default 0 check (love_count >= 0),
	add column if not exists haha_count integer not null default 0 check (haha_count >= 0),
	add column if not exists wow_count integer not null default 0 check (wow_count >= 0),
	add column if not exists sad_count integer not null default 0 check (sad_count >= 0),
	add column if not exists angry_count integer not null default 0 check (angry_count >= 0);

alter table public.post_reaction_counts enable row level security;

drop policy if exists "Anyone can read reaction counts" on public.post_reaction_counts;
create policy "Anyone can read reaction counts"
	on public.post_reaction_counts
	for select
	to anon, authenticated
	using (true);

grant select on table public.post_reaction_counts to anon, authenticated;

create or replace function public.record_post_reaction(
	p_slug text,
	p_previous_reaction text default '',
	p_next_reaction text default ''
)
returns public.post_reaction_counts
language plpgsql
security definer
set search_path = public
as $$
declare
	v_slug text := btrim(p_slug);
	v_previous text := coalesce(p_previous_reaction, '');
	v_next text := coalesce(p_next_reaction, '');
	v_counts public.post_reaction_counts;
begin
	if char_length(v_slug) not between 1 and 180 then
		raise exception 'Invalid post slug';
	end if;

	if v_previous not in ('', 'like', 'love', 'haha', 'wow', 'sad', 'angry') then
		raise exception 'Invalid previous reaction';
	end if;

	if v_next not in ('', 'like', 'love', 'haha', 'wow', 'sad', 'angry') then
		raise exception 'Invalid next reaction';
	end if;

	insert into public.post_reaction_counts (slug)
	values (v_slug)
	on conflict (slug) do nothing;

	if v_previous <> v_next then
		update public.post_reaction_counts
		set
			like_count = greatest(
				like_count
					+ case when v_next = 'like' then 1 else 0 end
					- case when v_previous = 'like' then 1 else 0 end,
				0
			),
			love_count = greatest(
				love_count
					+ case when v_next = 'love' then 1 else 0 end
					- case when v_previous = 'love' then 1 else 0 end,
				0
			),
			haha_count = greatest(
				haha_count
					+ case when v_next = 'haha' then 1 else 0 end
					- case when v_previous = 'haha' then 1 else 0 end,
				0
			),
			wow_count = greatest(
				wow_count
					+ case when v_next = 'wow' then 1 else 0 end
					- case when v_previous = 'wow' then 1 else 0 end,
				0
			),
			sad_count = greatest(
				sad_count
					+ case when v_next = 'sad' then 1 else 0 end
					- case when v_previous = 'sad' then 1 else 0 end,
				0
			),
			angry_count = greatest(
				angry_count
					+ case when v_next = 'angry' then 1 else 0 end
					- case when v_previous = 'angry' then 1 else 0 end,
				0
			),
			updated_at = now()
		where slug = v_slug;
	end if;

	select *
	into v_counts
	from public.post_reaction_counts
	where slug = v_slug;

	return v_counts;
end;
$$;

grant execute on function public.record_post_reaction(text, text, text) to anon, authenticated;
