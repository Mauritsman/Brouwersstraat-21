-- ============================================================
-- Startgegevens: de 6 bewoners en de 4 taken.
-- Draai dit NA schema.sql. Ook dit mag je meerdere keren draaien.
-- ============================================================

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

insert into public.tasks (key, title, subtitle, kind, deadline_weekday, sort_order, active) values
  ('afwas-keuken', 'AFWAS + KEUKEN',  'Alles afwassen, aanrecht en vuur schoonschrobben', 'duo',  5, 0, true),
  ('gang-trap',    'GANG + TRAP',     'Stofzuigen van gelijkvloers tot boven',            'solo', 5, 1, true),
  ('koertje',      'KOERTJE',         'Buiten opruimen en vegen',                          'solo', 5, 2, true),
  ('frigo',        'FRIGO LEEGMAKEN', 'Elke vrijdag: alles buiten dat er niet meer in hoort', 'solo', 5, 3, true)
on conflict (key) do update
  set title = excluded.title,
      subtitle = excluded.subtitle,
      kind = excluded.kind,
      deadline_weekday = excluded.deadline_weekday,
      sort_order = excluded.sort_order;
