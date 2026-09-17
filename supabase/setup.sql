-- ============================================================
--  BROUWERSSTRAAT 21 — DATABASE OPZETTEN
--
--  Kopieer ALLES uit dit bestand en plak het in Supabase onder:
--      SQL Editor  ->  New query  ->  Run
--
--  Dit maakt de tabellen aan en zet meteen de 6 bewoners en de 4 taken
--  erin. Je mag het gerust meerdere keren draaien; er gaat niets stuk.
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
  key               text primary key,        -- bv. 'afwas-keuken'
  title             text        not null,
  subtitle          text        not null default '',
  kind              text        not null check (kind in ('duo', 'solo')),
  -- Op welke dagen moet dit gebeuren? 1 = maandag ... 7 = zondag.
  -- Meerdere dagen = meerdere beurten per week. De keuken staat op {1,3,5}.
  deadline_weekdays smallint[]  not null default '{5}',
  sort_order        integer     not null default 0,
  active            boolean     not null default true,
  updated_at        timestamptz not null default now()
);

-- Draaide je een oudere versie van dit bestand? Dan stond er nog één vaste
-- dag per taak. Deze blok zet dat om naar de nieuwe lijst, zonder dataverlies.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'deadline_weekdays'
  ) then
    alter table public.tasks add column deadline_weekdays smallint[] not null default '{5}';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tasks' and column_name = 'deadline_weekday'
  ) then
    update public.tasks set deadline_weekdays = array[deadline_weekday]::smallint[];
    alter table public.tasks drop column deadline_weekday;
  end if;
end
$$;

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
  -- Welke beurt binnen de week: 1 = maandag ... 7 = zondag. Daardoor heeft
  -- de keuken van maandag een eigen vinkje naast die van woensdag en vrijdag.
  weekday      smallint    not null default 5 check (weekday between 1 and 7),
  assignee_ids text[],
  done         boolean     not null default false,
  done_by      text        references public.residents (id) on delete set null,
  done_at      timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (week_key, task_key, weekday)
);

-- Ook hier: een oudere database had één rij per taak per week, zonder dag.
-- We voegen de kolom toe en breiden de sleutel uit. Bestaande vinkjes
-- blijven staan en komen op vrijdag terecht.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'week_tasks' and column_name = 'weekday'
  ) then
    alter table public.week_tasks add column weekday smallint not null default 5;
    alter table public.week_tasks add constraint week_tasks_weekday_check check (weekday between 1 and 7);
  end if;

  if not exists (
    select 1
    from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any (i.indkey)
    where i.indrelid = 'public.week_tasks'::regclass and i.indisprimary and a.attname = 'weekday'
  ) then
    alter table public.week_tasks drop constraint if exists week_tasks_pkey;
    alter table public.week_tasks add primary key (week_key, task_key, weekday);
  end if;
end
$$;

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

-- ------------------------------------------------------------
-- 8. Startgegevens: de 6 bewoners en de 4 taken
-- ------------------------------------------------------------
insert into public.residents (id, name, floor, color, sort_order, active) values
  ('jules',   'Jules',   'gelijkvloers', '#FF3B00', 0, true),
  ('ruiz',    'Ruiz',    'gelijkvloers', '#FF8A00', 1, true),
  ('maurits', 'Maurits', 'eerste',       '#FFC300', 2, true),
  ('sander',  'Sander',  'eerste',       '#00E5FF', 3, true),
  ('bas',     'Bas',     'tweede',       '#39FF14', 4, true),
  ('bo',      'Bo',      'tweede',       '#FF00A8', 5, true)
on conflict (id) do update
  set name = excluded.name,
      floor = excluded.floor,
      color = excluded.color,
      sort_order = excluded.sort_order;

insert into public.tasks (key, title, subtitle, kind, deadline_weekdays, sort_order, active) values
  -- De keuken moet drie keer per week: maandag, woensdag en vrijdag.
  ('afwas-keuken', 'AFWAS + KEUKEN',  'Alles afwassen, aanrecht en vuur schoonschrobben', 'duo',  '{1,3,5}', 0, true),
  ('gang-trap',    'GANG + TRAP',     'Stofzuigen van gelijkvloers tot boven',            'solo', '{5}',     1, true),
  ('koertje',      'KOERTJE',         'Buiten opruimen en vegen',                          'solo', '{5}',     2, true),
  ('frigo',        'FRIGO LEEGMAKEN', 'Elke vrijdag: alles buiten dat er niet meer in hoort', 'solo', '{5}', 3, true)
on conflict (key) do update
  set title = excluded.title,
      subtitle = excluded.subtitle,
      kind = excluded.kind,
      deadline_weekdays = excluded.deadline_weekdays,
      sort_order = excluded.sort_order;
