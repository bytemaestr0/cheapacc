-- Adds a username field to profiles for account settings (/account).
-- Nullable + unique-if-set: users aren't required to pick one, but if
-- they do, it can't collide with someone else's.

alter table profiles add column username text;
create unique index profiles_username_key on profiles (username) where username is not null;

-- profiles_update_own (from 0001_init.sql) already allows a user to
-- update their own row, which covers updating username. No RLS change
-- needed here.
