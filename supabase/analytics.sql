-- Privacy-friendly page analytics for the blog and Second Brain.
-- Run this file once in Supabase SQL Editor before deploying the dashboard.

create table if not exists public.analytics_page_views (
	id uuid primary key,
	path text not null,
	title text not null default '',
	visitor_hash text not null,
	session_hash text not null,
	referrer_host text not null default '',
	device_type text not null default 'unknown',
	viewed_at timestamptz not null default now(),
	constraint analytics_path_check check (
		char_length(path) between 1 and 500 and left(path, 1) = '/'
	),
	constraint analytics_title_check check (char_length(title) <= 180),
	constraint analytics_visitor_hash_check check (char_length(visitor_hash) = 64),
	constraint analytics_session_hash_check check (char_length(session_hash) = 64),
	constraint analytics_referrer_check check (char_length(referrer_host) <= 180),
	constraint analytics_device_check check (
		device_type in ('desktop', 'mobile', 'tablet', 'unknown')
	)
);

create index if not exists analytics_page_views_viewed_at_idx
	on public.analytics_page_views (viewed_at desc);

create index if not exists analytics_page_views_path_viewed_at_idx
	on public.analytics_page_views (path, viewed_at desc);

create index if not exists analytics_page_views_visitor_viewed_at_idx
	on public.analytics_page_views (visitor_hash, viewed_at desc);

alter table public.analytics_page_views enable row level security;

-- The browser never talks to this table directly. Both writes and admin reads
-- go through server APIs authenticated with the Supabase service role.
revoke all on table public.analytics_page_views from anon, authenticated;

-- Drop bursts from one anonymous browser session before they can inflate the
-- dashboard. This trigger does not store an IP address or other identity data.
create or replace function public.limit_analytics_session_rate()
returns trigger
language plpgsql
set search_path = public
as $$
begin
	if (
		select count(*) >= 120
		from public.analytics_page_views
		where session_hash = new.session_hash
			and viewed_at >= now() - interval '1 minute'
	) then
		return null;
	end if;
	return new;
end;
$$;

drop trigger if exists analytics_session_rate_limit
	on public.analytics_page_views;
create trigger analytics_session_rate_limit
	before insert on public.analytics_page_views
	for each row execute function public.limit_analytics_session_rate();
