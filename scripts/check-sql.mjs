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

const tasks = await db.query('select key, kind from public.tasks order by sort_order');
console.log(`\nTaken (${tasks.rows.length}):`);
for (const t of tasks.rows) console.log(`  ${t.key.padEnd(14)} ${t.kind}`);

// De app schrijft dit soort rijen weg; controleer dat dat echt lukt.
await db.exec(`
  insert into public.week_tasks (week_key, task_key, assignee_ids, done, done_by, done_at)
  values ('2026-W38', 'gang-trap', array['sander'], true, 'maurits', now())
  on conflict (week_key, task_key) do update set done = excluded.done;
`);
const wt = await db.query('select week_key, task_key, assignee_ids, done, done_by from public.week_tasks');
console.log('\nTestrij wegschrijven (afvinken + ruilen):');
console.log(' ', JSON.stringify(wt.rows[0]));

// Foreign key moet een onbekende bewoner tegenhouden.
let blocked = false;
try {
  await db.exec(`insert into public.week_tasks (week_key, task_key, done_by) values ('2026-W39','frigo','bestaat-niet')`);
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

await db.close();
if (!blocked || !allOn) process.exit(1);
console.log('\nALLES OK — deze SQL kan je veilig in Supabase plakken.');
