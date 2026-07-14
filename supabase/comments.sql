-- Supabase blog interactions with anonymous submission and admin moderation.
-- Run this file once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.blog_comments (
	id uuid primary key default gen_random_uuid(),
	slug text not null,
	body text not null,
	status text not null default 'pending',
	parent_id uuid,
	author_name text not null default 'Ẩn danh',
	is_author boolean not null default false,
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

alter table public.blog_comments
	add column if not exists parent_id uuid,
	add column if not exists author_name text not null default 'Ẩn danh',
	add column if not exists is_author boolean not null default false;

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'blog_comments_parent_id_fkey'
			and conrelid = 'public.blog_comments'::regclass
	) then
		alter table public.blog_comments
			add constraint blog_comments_parent_id_fkey
			foreign key (parent_id)
			references public.blog_comments(id)
			on delete cascade;
	end if;
end;
$$;

create index if not exists blog_comments_slug_status_created_idx
	on public.blog_comments (slug, status, created_at desc);

create index if not exists blog_comments_parent_created_idx
	on public.blog_comments (parent_id, created_at asc);

-- Optional notification emails are deliberately separated from public comment
-- rows. Only service-role API functions can read this table.
create table if not exists public.comment_subscriptions (
	comment_id uuid primary key
		references public.blog_comments(id)
		on delete cascade,
	email text not null,
	created_at timestamptz not null default now(),
	constraint comment_subscriptions_email_length_check check (
		char_length(email) between 3 and 254
	)
);

alter table public.comment_subscriptions enable row level security;
revoke all on table public.comment_subscriptions from anon, authenticated;

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

create table if not exists public.comment_submission_log (
	id uuid primary key default gen_random_uuid(),
	comment_id uuid not null
		references public.blog_comments(id)
		on delete cascade,
	ip_hash text not null,
	body_hash text not null,
	slug text not null,
	created_at timestamptz not null default now()
);

alter table public.comment_submission_log
	add column if not exists comment_id uuid;

-- Rows created by older versions cannot be linked reliably. Clearing them once
-- prevents a deleted/rejected comment from blocking a legitimate resubmission.
delete from public.comment_submission_log
	where comment_id is null;

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'comment_submission_log_comment_id_fkey'
			and conrelid = 'public.comment_submission_log'::regclass
	) then
		alter table public.comment_submission_log
			add constraint comment_submission_log_comment_id_fkey
			foreign key (comment_id)
			references public.blog_comments(id)
			on delete cascade;
	end if;
end
$$;

alter table public.comment_submission_log
	alter column comment_id set not null;

create unique index if not exists comment_submission_log_comment_id_idx
	on public.comment_submission_log (comment_id);

create index if not exists comment_submission_log_ip_created_idx
	on public.comment_submission_log (ip_hash, created_at desc);

create index if not exists comment_submission_log_duplicate_idx
	on public.comment_submission_log (ip_hash, body_hash, created_at desc);

alter table public.comment_submission_log enable row level security;
revoke all on table public.comment_submission_log from anon, authenticated;

drop function if exists public.submit_blog_comment(text, text, text, text);
drop function if exists public.submit_blog_comment(text, text, text, text, uuid);
drop function if exists public.submit_blog_comment(text, text, text, text, uuid, text, text);

create or replace function public.submit_blog_comment(
	p_slug text,
	p_body text,
	p_ip_hash text,
	p_body_hash text,
	p_parent_id uuid default null,
	p_author_name text default '',
	p_notification_email text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
	v_slug text := btrim(p_slug);
	v_body text := btrim(p_body);
	v_author_name text := regexp_replace(btrim(coalesce(p_author_name, '')), '\s+', ' ', 'g');
	v_notification_email text := lower(btrim(coalesce(p_notification_email, '')));
	v_id uuid;
begin
	if char_length(v_slug) not between 1 and 180
		or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
		raise exception 'INVALID_SLUG';
	end if;
	if char_length(v_body) not between 1 and 600 then
		raise exception 'INVALID_BODY';
	end if;
	if v_author_name = '' then
		v_author_name := 'Ẩn danh';
	end if;
	if char_length(v_author_name) > 60
		or v_author_name ~ '[[:cntrl:]]' then
		raise exception 'INVALID_NAME';
	end if;
	if v_notification_email <> '' and (
		char_length(v_notification_email) > 254
		or v_notification_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
	) then
		raise exception 'INVALID_EMAIL';
	end if;
	if p_parent_id is not null and not exists (
		select 1
		from public.blog_comments
		where id = p_parent_id
			and slug = v_slug
			and status = 'approved'
	) then
		raise exception 'INVALID_PARENT';
	end if;

	perform pg_advisory_xact_lock(hashtext(p_ip_hash));
	if (
		select count(*)
		from public.comment_submission_log
		where ip_hash = p_ip_hash
			and created_at >= now() - interval '10 minutes'
	) >= 12 then
		raise exception 'RATE_LIMIT';
	end if;
	if exists (
		select 1
		from public.comment_submission_log
		where ip_hash = p_ip_hash
			and body_hash = p_body_hash
			and slug = v_slug
			and created_at >= now() - interval '24 hours'
	) then
		raise exception 'DUPLICATE';
	end if;

	insert into public.blog_comments (slug, body, status, parent_id, author_name, is_author)
	values (v_slug, v_body, 'pending', p_parent_id, v_author_name, false)
	returning id into v_id;

	if v_notification_email <> '' then
		insert into public.comment_subscriptions (comment_id, email)
		values (v_id, v_notification_email);
	end if;

	insert into public.comment_submission_log (comment_id, ip_hash, body_hash, slug)
	values (v_id, p_ip_hash, p_body_hash, v_slug);

	delete from public.comment_submission_log
	where created_at < now() - interval '7 days';

	return v_id;
end;
$$;

revoke all on function public.submit_blog_comment(text, text, text, text, uuid, text, text)
	from public, anon, authenticated;
grant execute on function public.submit_blog_comment(text, text, text, text, uuid, text, text)
	to service_role;

drop policy if exists "Admins can insert author replies" on public.blog_comments;
create policy "Admins can insert author replies"
	on public.blog_comments
	for insert
	to authenticated
	with check (public.is_comment_admin());

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

-- Aggregate reactions for each approved comment. Individual anonymous votes are
-- kept private so a browser can change its reaction without inflating counts.
create table if not exists public.comment_reaction_counts (
	comment_id uuid primary key
		references public.blog_comments(id)
		on delete cascade,
	like_count integer not null default 0 check (like_count >= 0),
	love_count integer not null default 0 check (love_count >= 0),
	haha_count integer not null default 0 check (haha_count >= 0),
	wow_count integer not null default 0 check (wow_count >= 0),
	sad_count integer not null default 0 check (sad_count >= 0),
	angry_count integer not null default 0 check (angry_count >= 0),
	updated_at timestamptz not null default now()
);

create table if not exists public.comment_reaction_votes (
	comment_id uuid not null
		references public.blog_comments(id)
		on delete cascade,
	voter_id uuid not null,
	reaction text not null
		check (reaction in ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	primary key (comment_id, voter_id)
);

alter table public.comment_reaction_counts enable row level security;
alter table public.comment_reaction_votes enable row level security;

drop policy if exists "Anyone can read comment reaction counts"
	on public.comment_reaction_counts;
create policy "Anyone can read comment reaction counts"
	on public.comment_reaction_counts
	for select
	to anon, authenticated
	using (true);

grant select on table public.comment_reaction_counts to anon, authenticated;
revoke all on table public.comment_reaction_votes from anon, authenticated;

create or replace function public.record_comment_reaction(
	p_comment_id uuid,
	p_voter_id uuid,
	p_next_reaction text default ''
)
returns public.comment_reaction_counts
language plpgsql
security definer
set search_path = public
as $$
declare
	v_previous text := '';
	v_next text := coalesce(p_next_reaction, '');
	v_counts public.comment_reaction_counts;
begin
	if p_comment_id is null or p_voter_id is null then
		raise exception 'Invalid comment reaction identity';
	end if;

	if v_next not in ('', 'like', 'love', 'haha', 'wow', 'sad', 'angry') then
		raise exception 'Invalid next reaction';
	end if;

	if not exists (
		select 1
		from public.blog_comments
		where id = p_comment_id and status = 'approved'
	) then
		raise exception 'Comment is not available';
	end if;

	perform pg_advisory_xact_lock(
		hashtextextended(p_comment_id::text || ':' || p_voter_id::text, 0)
	);

	select reaction
	into v_previous
	from public.comment_reaction_votes
	where comment_id = p_comment_id and voter_id = p_voter_id;
	v_previous := coalesce(v_previous, '');

	insert into public.comment_reaction_counts (comment_id)
	values (p_comment_id)
	on conflict (comment_id) do nothing;

	if v_previous <> v_next then
		if v_next = '' then
			delete from public.comment_reaction_votes
			where comment_id = p_comment_id and voter_id = p_voter_id;
		else
			insert into public.comment_reaction_votes (
				comment_id,
				voter_id,
				reaction
			)
			values (p_comment_id, p_voter_id, v_next)
			on conflict (comment_id, voter_id) do update
			set reaction = excluded.reaction, updated_at = now();
		end if;

		update public.comment_reaction_counts
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
		where comment_id = p_comment_id;
	end if;

	select *
	into v_counts
	from public.comment_reaction_counts
	where comment_id = p_comment_id;

	return v_counts;
end;
$$;

revoke all on function public.record_comment_reaction(uuid, uuid, text) from public;
grant execute on function public.record_comment_reaction(uuid, uuid, text)
	to anon, authenticated;
