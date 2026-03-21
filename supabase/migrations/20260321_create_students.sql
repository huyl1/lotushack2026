CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sat_score INTEGER,
  ielts_score NUMERIC(2,1),
  gpa NUMERIC,
  act_score INTEGER,
  target_majors TEXT[],
  preferred_countries TEXT[],
  preferred_setting TEXT,
  preferred_size TEXT,
  budget_usd NUMERIC,
  needs_financial_aid BOOLEAN,
  target_acceptance_rate_min NUMERIC,
  application_round TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only authenticated users (no anonymous access)
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.student_states FROM anon;
