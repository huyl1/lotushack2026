-- Replace single description column with per-category description columns
ALTER TABLE public.recommendations
  DROP COLUMN IF EXISTS description,
  ADD COLUMN IF NOT EXISTS academic_alignment_description      TEXT,
  ADD COLUMN IF NOT EXISTS financial_sustainability_description TEXT,
  ADD COLUMN IF NOT EXISTS student_success_description         TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle_culture_description       TEXT,
  ADD COLUMN IF NOT EXISTS admission_chance_description        TEXT;
