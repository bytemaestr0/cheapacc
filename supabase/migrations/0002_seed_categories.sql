-- Seeds the fixed category set the UI expects (lib/categories.ts).
-- Safe to re-run: uses ON CONFLICT DO NOTHING keyed on the unique slug.
-- If you're using Prisma migrate + prisma/seed.ts instead of the SQL
-- editor, this same data is inserted by `npm run db:seed` and you don't
-- need to run this file too.

insert into categories (name, slug) values
  ('Steam', 'steam'),
  ('Valorant', 'valorant'),
  ('CS:GO', 'csgo'),
  ('Minecraft', 'minecraft'),
  ('Fortnite', 'fortnite'),
  ('Other', 'other')
on conflict (slug) do nothing;
