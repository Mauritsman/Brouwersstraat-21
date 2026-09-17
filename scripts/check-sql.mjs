/**
 * Draait supabase/setup.sql in een echte Postgres (in het geheugen) om te
 * controleren dat er geen fouten in zitten. Draaien met:
 *   node scripts/check-sql.mjs
 *
 * Supabase heeft een paar dingen die een kale Postgres niet heeft (de rollen
 * 'anon' en 'authenticated', en de publicatie 'supabase_realtime'). Die maken
 * we hier eerst aan, zodat we exact dezelfde SQL kunnen testen.
 */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const db = new PGlite();

await db.exec(`
  create role anon;
  create role authenticated;
  create publication supabase_realtime;
`);

const sql = readFileSync('supabase/setup.sql', 'utf8');

async function run(label) {
  await db.exec(sql);
  console.log(`✓ ${label}`);
}

// Twee keer draaien: het moet ook de tweede keer foutloos gaan.
await run('setup.sql draait zonder fouten');
await run('setup.sql is herhaalbaar (tweede keer ook goed)');

const tables = await db.query(`
  select table_name from information_schema.tables
  where table_schema = 'public' order by table_name
`);
console.log('\nTabellen:', tables.rows.map((r) => r.table_name).join(', '));

const residents = await db.query('select name, floor, color from public.residents order by sort_order');
console.log(`\nBewoners (${residents.rows.length}):`);
for (const r of residents.rows) console.log(`  ${r.name.padEnd(9)} ${r.floor.padEnd(13)} ${r.color}`);

const tasks = await db.query('select key, kind, deadline_weekdays from public.tasks order by sort_order');
console.log(`\nTaken (${tasks.rows.length}):`);
const dagen = ['', 'ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
for (const t of tasks.rows) {
  const d = t.deadline_weekdays.map((n) => dagen[n]).join('+');
  console.log(`  ${t.key.padEnd(14)} ${t.kind.padEnd(5)} ${d}`);
}

// De app schrijft dit soort rijen weg; controleer dat dat echt lukt.
await db.exec(`
  insert into public.week_tasks (week_key, task_key, weekday, assignee_ids, done, done_by, done_at)
  values ('2026-W38', 'afwas-keuken', 1, array['jules','ruiz'], true, 'jules', now()),
         ('2026-W38', 'afwas-keuken', 3, null, false, null, null),
         ('2026-W38', 'afwas-keuken', 5, null, false, null, null)
  on conflict (week_key, task_key, weekday) do update set done = excluded.done;
`);
const wt = await db.query('select weekday, done from public.week_tasks order by weekday');
console.log('\nDrie losse keukenbeurten in dezelfde week:');
for (const r of wt.rows) console.log(`  ${dagen[r.weekday]}  gedaan=${r.done}`);
const apart = wt.rows.length === 3 && wt.rows.filter((r) => r.done).length === 1;
console.log(`${apart ? '✓' : '✗'} Elke beurt heeft een eigen vinkje`);

// Foreign key moet een onbekende bewoner tegenhouden.
let blocked = false;
try {
  await db.exec(`insert into public.week_tasks (week_key, task_key, weekday, done_by) values ('2026-W39','frigo',5,'bestaat-niet')`);
} catch {
  blocked = true;
}
console.log(`\n${blocked ? '✓' : '✗'} Onbekende bewoner wordt geweigerd door de foreign key`);

// RLS moet aan staan op alle vier de tabellen.
const rls = await db.query(`
  select relname, relrowsecurity from pg_class
  where relname in ('residents','tasks','week_tasks','push_tokens') order by relname
`);
const allOn = rls.rows.every((r) => r.relrowsecurity);
console.log(`${allOn ? '✓' : '✗'} RLS staat aan op alle tabellen`);

// --- Migratietest: werkt dit ook op een database die de OUDE opzet had? ---
const oud = new PGlite();
await oud.exec(`create role anon; create role authenticated; create publication supabase_realtime;`);
await oud.exec(`
  create table public.residents (id text primary key, name text not null, floor text not null,
    color text not null, sort_order integer not null default 0, active boolean not null default true,
    updated_at timestamptz not null default now());
  create table public.tasks (key text primary key, title text not null, subtitle text not null default '',
    kind text not null, deadline_weekday smallint not null default 5, sort_order integer not null default 0,
    active boolean not null default true, updated_at timestamptz not null default now());
  create table public.week_tasks (week_key text not null, task_key text not null references public.tasks(key),
    assignee_ids text[], done boolean not null default false, done_by text, done_at timestamptz,
    updated_at timestamptz not null default now(), primary key (week_key, task_key));
  insert into public.tasks (key,title,kind,deadline_weekday) values ('frigo','FRIGO','solo',5);
  insert into public.week_tasks (week_key,task_key,done) values ('2026-W37','frigo',true);
`);
await oud.exec(sql);
const bewaard = await oud.query(`select weekday, done from public.week_tasks where week_key='2026-W37'`);
const kolommen = await oud.query(`select deadline_weekdays from public.tasks where key='frigo'`);
const okMigratie =
  bewaard.rows.length === 1 && bewaard.rows[0].done === true && bewaard.rows[0].weekday === 5 &&
  JSON.stringify(kolommen.rows[0].deadline_weekdays) === '[5]';
console.log(`\n${okMigratie ? '✓' : '✗'} Oude database migreert zonder vinkjes te verliezen`);
await oud.close();

await db.close();
if (!blocked || !allOn || !apart || !okMigratie) process.exit(1);
console.log('\nALLES OK — deze SQL kan je veilig in Supabase plakken.');
