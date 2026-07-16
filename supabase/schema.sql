create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (name)
values ('guest'), ('user'), ('admin')
on conflict (name) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  role text not null default 'user' references public.roles(name),
  last_seen_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] default '{}',
  comment_count int not null default 0,
  like_count int not null default 0,
  view_count int not null default 0,
  bookmark_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thread_tags (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (thread_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid references public.threads(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((thread_id is not null) or (comment_id is not null)),
  unique nulls not distinct (user_id, thread_id),
  unique nulls not distinct (user_id, comment_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, thread_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid references public.threads(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  report_reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((thread_id is not null) or (comment_id is not null))
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  bucket_name text not null default 'thread-images',
  file_name text,
  file_url text not null,
  file_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_threads_category_id on public.threads(category_id);
create index if not exists idx_threads_author_id on public.threads(author_id);
create index if not exists idx_comments_thread_id on public.comments(thread_id);
create index if not exists idx_comments_parent_comment_id on public.comments(parent_comment_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_bookmarks_user_id on public.bookmarks(user_id);
create index if not exists idx_likes_thread_id on public.likes(thread_id);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.increment_thread_view_count(target_thread_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.threads
  set view_count = view_count + 1
  where id = target_thread_id;
end;
$$;

create or replace function public.sync_thread_comment_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.threads
    set comment_count = comment_count + 1
    where id = new.thread_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.threads
    set comment_count = greatest(comment_count - 1, 0)
    where id = old.thread_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.sync_thread_like_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.thread_id is null and old.thread_id is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' and new.thread_id is not null then
    update public.threads
    set like_count = like_count + 1
    where id = new.thread_id;
    return new;
  end if;

  if tg_op = 'DELETE' and old.thread_id is not null then
    update public.threads
    set like_count = greatest(like_count - 1, 0)
    where id = old.thread_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.sync_thread_bookmark_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.threads
    set bookmark_count = bookmark_count + 1
    where id = new.thread_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.threads
    set bookmark_count = greatest(bookmark_count - 1, 0)
    where id = old.thread_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.handle_thread_comment_notifications()
returns trigger
language plpgsql
security definer
as $$
declare
  thread_owner_id uuid;
  parent_owner_id uuid;
  mention_username text;
  mention_user_id uuid;
begin
  select author_id into thread_owner_id from public.threads where id = new.thread_id;

  if thread_owner_id is not null and thread_owner_id != new.author_id then
    insert into public.notifications (user_id, actor_id, type, message, link)
    values (
      thread_owner_id,
      new.author_id,
      'thread_comment',
      'Seseorang mengomentari thread Anda.',
      '/forum/' || new.thread_id::text
    );
  end if;

  if new.parent_comment_id is not null then
    select author_id into parent_owner_id from public.comments where id = new.parent_comment_id;
    if parent_owner_id is not null and parent_owner_id != new.author_id then
      insert into public.notifications (user_id, actor_id, type, message, link)
      values (
        parent_owner_id,
        new.author_id,
        'comment_reply',
        'Seseorang membalas komentar Anda.',
        '/forum/' || new.thread_id::text
      );
    end if;
  end if;

  for mention_username in
    select distinct (regexp_matches(new.content, '@([A-Za-z0-9_]+)', 'g'))[1]
  loop
    select id into mention_user_id from public.profiles where username = mention_username;
    if mention_user_id is not null and mention_user_id != new.author_id then
      insert into public.notifications (user_id, actor_id, type, message, link)
      values (
        mention_user_id,
        new.author_id,
        'mention',
        'Anda disebut dalam sebuah komentar.',
        '/forum/' || new.thread_id::text
      );
    end if;
  end loop;

  return new;
end;
$$;

create or replace function public.handle_thread_like_notifications()
returns trigger
language plpgsql
security definer
as $$
declare
  thread_owner_id uuid;
begin
  if new.thread_id is null then
    return new;
  end if;

  select author_id into thread_owner_id from public.threads where id = new.thread_id;

  if thread_owner_id is not null and thread_owner_id != new.user_id then
    insert into public.notifications (user_id, actor_id, type, message, link)
    values (
      thread_owner_id,
      new.user_id,
      'thread_like',
      'Seseorang menyukai thread Anda.',
      '/forum/' || new.thread_id::text
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists comments_after_insert_notification on public.comments;
create trigger comments_after_insert_notification
after insert on public.comments
for each row execute function public.handle_thread_comment_notifications();

drop trigger if exists comments_after_insert_sync_count on public.comments;
create trigger comments_after_insert_sync_count
after insert on public.comments
for each row execute function public.sync_thread_comment_count();

drop trigger if exists comments_after_delete_sync_count on public.comments;
create trigger comments_after_delete_sync_count
after delete on public.comments
for each row execute function public.sync_thread_comment_count();

drop trigger if exists likes_after_insert_sync_count on public.likes;
create trigger likes_after_insert_sync_count
after insert on public.likes
for each row execute function public.sync_thread_like_count();

drop trigger if exists likes_after_delete_sync_count on public.likes;
create trigger likes_after_delete_sync_count
after delete on public.likes
for each row execute function public.sync_thread_like_count();

drop trigger if exists likes_after_insert_notification on public.likes;
create trigger likes_after_insert_notification
after insert on public.likes
for each row execute function public.handle_thread_like_notifications();

drop trigger if exists bookmarks_after_insert_sync_count on public.bookmarks;
create trigger bookmarks_after_insert_sync_count
after insert on public.bookmarks
for each row execute function public.sync_thread_bookmark_count();

drop trigger if exists bookmarks_after_delete_sync_count on public.bookmarks;
create trigger bookmarks_after_delete_sync_count
after delete on public.bookmarks
for each row execute function public.sync_thread_bookmark_count();

do $$
declare
  target_table text;
begin
  for target_table in
    select unnest(array[
      'profiles', 'roles', 'categories', 'threads', 'thread_tags', 'tags',
      'comments', 'bookmarks', 'likes', 'notifications', 'reports', 'attachments'
    ])
  loop
    execute format('alter table public.%I enable row level security;', target_table);
  end loop;
end $$;

create policy "guest can read categories"
on public.categories for select
to anon, authenticated
using (true);

create policy "guest can read tags"
on public.tags for select
to anon, authenticated
using (true);

create policy "guest can read roles"
on public.roles for select
to anon, authenticated
using (true);

create policy "guest can read threads"
on public.threads for select
to anon, authenticated
using (true);

create policy "guest can read comments"
on public.comments for select
to anon, authenticated
using (true);

create policy "profiles readable by everyone"
on public.profiles for select
to anon, authenticated
using (true);

create policy "user can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "authenticated can insert threads"
on public.threads for insert
to authenticated
with check (auth.uid() = author_id);

create policy "user can update own thread"
on public.threads for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "user can delete own thread"
on public.threads for delete
to authenticated
using (auth.uid() = author_id);

create policy "authenticated can comment"
on public.comments for insert
to authenticated
with check (auth.uid() = author_id);

create policy "user can update own comment"
on public.comments for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "user can delete own comment"
on public.comments for delete
to authenticated
using (auth.uid() = author_id);

create policy "authenticated manage own bookmarks"
on public.bookmarks for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "authenticated manage own likes"
on public.likes for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "authenticated read own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

create policy "authenticated update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "authenticated can create reports"
on public.reports for insert
to authenticated
with check (auth.uid() = reporter_id);

create policy "user can read own reports"
on public.reports for select
to authenticated
using (auth.uid() = reporter_id);

create policy "user can upload own attachments"
on public.attachments for insert
to authenticated
with check (auth.uid() = uploader_id);

create policy "attachments readable by everyone"
on public.attachments for select
to anon, authenticated
using (true);

-- Helper function to get current user's role without triggering RLS recursion
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "admin full profile access"
on public.profiles for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create policy "admin full thread access"
on public.threads for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create policy "admin full comment access"
on public.comments for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create policy "admin full report access"
on public.reports for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

create policy "admin full category access"
on public.categories for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');
