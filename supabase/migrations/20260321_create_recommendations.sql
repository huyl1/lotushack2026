CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_state_id UUID NOT NULL REFERENCES public.student_states(id) ON DELETE CASCADE,
  major_id UUID NOT NULL REFERENCES public.majors(id) ON DELETE CASCADE,
  match_category TEXT NOT NULL CHECK (match_category IN ('reach', 'match', 'safety')),
  description TEXT,
  -- Weighted score components (each 0-100)
  academic_alignment NUMERIC,        -- 35%
  financial_sustainability NUMERIC,  -- 25%
  student_success NUMERIC,           -- 15%
  lifestyle_culture NUMERIC,         -- 15%
  admission_chance NUMERIC,          -- 10%
  composite_score NUMERIC GENERATED ALWAYS AS (
    COALESCE(academic_alignment, 0) * 0.35 +
    COALESCE(financial_sustainability, 0) * 0.25 +
    COALESCE(student_success, 0) * 0.15 +
    COALESCE(lifestyle_culture, 0) * 0.15 +
    COALESCE(admission_chance, 0) * 0.10
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_state_id, major_id)
);

-- Only authenticated users (no anonymous access)
REVOKE ALL ON public.recommendations FROM anon;
