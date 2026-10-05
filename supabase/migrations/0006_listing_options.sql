-- Per-listing option chips, e.g. [{"label":"Limited","tone":"negative"}].
-- tone: positive (green, thumbs up) | negative (red, thumbs down) | info (gray).
alter table listings
  add column if not exists options jsonb not null default '[]'::jsonb;
