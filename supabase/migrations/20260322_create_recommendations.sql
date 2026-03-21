CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  major_name TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('reach', 'match', 'safety')),
  composite_score NUMERIC(5, 2),
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  reasoning TEXT,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, university_id)
);

CREATE INDEX recommendations_student_id_idx ON public.recommendations (student_id);

-- Only authenticated users
REVOKE ALL ON public.recommendations FROM anon;
