ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'new'
  CHECK (stage IN ('new', 'profile_building', 'matched', 'presented', 'decided', 'archived'));
