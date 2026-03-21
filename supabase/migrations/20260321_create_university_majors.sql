CREATE TABLE public.university_majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  major_name TEXT NOT NULL,
  acceptance_rate NUMERIC,
  supplemental_requirements TEXT,
  subject_ranking INTEGER,
  ielts_min NUMERIC(2,1),
  toefl_min INTEGER,
  sat_min INTEGER,
  act_min INTEGER,
  gpa_min NUMERIC,
  a_level_grades TEXT,
  ib_min INTEGER,
  atar_min NUMERIC,
  duolingo_min INTEGER,
  pte_min INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (university_id, major_name)
);

-- Only authenticated users (no anonymous access)
REVOKE ALL ON public.university_majors FROM anon;
