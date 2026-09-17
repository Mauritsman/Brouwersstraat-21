-- ============================================================
-- Brouwersstraat 21 — databaseschema
--
-- Plak dit in Supabase onder: SQL Editor -> New query -> Run.
-- Je mag het meerdere keren draaien; alles is "if not exists".
-- ============================================================

-- ------------------------------------------------------------
-- 1. Bewoners
-- ------------------------------------------------------------
create table if not exists public.residents (
  id          text primary key,             -- bv. 'maurits'
  name        text        not null,
  floor       text        not null check (floor in ('gelijkvloers', 'eerste', 'tweede')),
  color       text        not null,          -- de vlam-kleur, bv. '#FFC300'
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Taken
--    'duo'  = samen door de twee bewoners van hetzelfde verdiep
--    'solo' = één bewoner
-- ------------------------------------------------------------
create table if not exists public.tasks (
  key              text primary key,         -- bv. 'afwas-keuken'
  title            text        not null,
  subtitle         text        not null default '',
  kind             text        not null check (kind in ('duo', 'solo')),
  deadline_weekday smallint    not null default 5 check (deadline_weekday between 1 and 7),
  sort_order       integer     not null default 0,
  active           boolean     not null default true,
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. Weekstatus
--    De app REKENT de rotatie zelf uit. Hier staat enkel wat daarvan
--    afwijkt: afgevinkt en geruild. Dat houdt de tabel klein en zorgt
--    dat de app ook offline de juiste taken toont.
--
--    assignee_ids is null  -> gewoon de rotatie volgen
--    assignee_ids gevuld   -> geruild, deze mensen doen het nu
-- ------------------------------------------------------------
create table if not exists public.week_tasks (
  week_key     text        not null,          -- bv. '2026-W38'
  task_key     text        not null references public.tasks (key) on delete cascade,
  assignee_ids text[],
  done         boolean     not null default false,
  done_by      text        references public.residents (id) on delete set null,
  done_at      timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (week_key, task_key)
);

create index if not exists week_tasks_week_idx on public.week_tasks (week_key);

-- ------------------------------------------------------------
-- 4. Push-tokens
--    Enkel nodig als je later notificaties vanaf een server wil sturen.
--    De gewone herinneringen plant de app lokaal op het toestel in.
-- ------------------------------------------------------------
create table if not exists public.push_tokens (
  resident_id text primary key references public.residents (id) on delete cascade,
  token       text        not null,
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. updated_at automatisch bijhouden
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists residents_touch   on public.residents;
drop trigger if exists tasks_touch       on public.tasks;
drop trigger if exists week_tasks_touch  on public.week_tasks;
drop trigger if exists push_tokens_touch on public.push_tokens;

create trigger residents_touch   before update on public.residents   for each row execute function public.touch_updated_at();
create trigger tasks_touch       before update on public.tasks       for each row execute function public.touch_updated_at();
create trigger week_tasks_touch  before update on public.week_tasks  for each row execute function public.touch_updated_at();
create trigger push_tokens_touch before update on public.push_tokens for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 6. Toegang (RLS)
--
--    LET OP — bewuste keuze: deze app heeft geen login. Iedereen die de
--    app opent gebruikt dezelfde 'anon'-sleutel. De regels hieronder laten
--    daarom lezen en schrijven toe met die sleutel.
--
--    Dat is prima voor een kot met 6 mensen, maar het betekent wel:
--    wie je anon-sleutel heeft, kan de taken lezen en aanpassen.
--    Zet die sleutel dus niet in een publieke repo of op een website.
--    Wil je het later dichttimmeren, dan heb je echte accounts nodig.
--
--    push_tokens is strenger: wel schrijven, niet lezen. Zo kan niemand
--    de tokens van de anderen ophalen.
-- ------------------------------------------------------------
alter table public.residents   enable row level security;
alter table public.tasks       enable row level security;
alter table public.week_tasks  enable row level security;
alter table public.push_tokens enable row level security;

drop policy if exists residents_all   on public.residents;
drop policy if exists tasks_all       on public.tasks;
drop policy if exists week_tasks_all  on public.week_tasks;
drop policy if exists push_tokens_ins on public.push_tokens;
drop policy if exists push_tokens_upd on public.push_tokens;

create policy residents_all  on public.residents  for all to anon, authenticated using (true) with check (true);
create policy tasks_all      on public.tasks      for all to anon, authenticated using (true) with check (true);
create policy week_tasks_all on public.week_tasks for all to anon, authenticated using (true) with check (true);

-- Tokens: toevoegen en bijwerken mag, uitlezen niet.
create policy push_tokens_ins on public.push_tokens for insert to anon, authenticated with check (true);
create policy push_tokens_upd on public.push_tokens for update to anon, authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- 7. Realtime: zo ziet iedereen een vinkje of een ruil meteen
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'week_tasks'
  ) then
    alter publication supabase_realtime add table public.week_tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'residents'
  ) then
    alter publication supabase_realtime add table public.residents;
  end if;
end
$$;
