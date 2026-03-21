CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qs_rank TEXT NOT NULL,
  previous_rank TEXT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  size TEXT,
  focus TEXT,
  research TEXT,
  status TEXT,
  ar_score NUMERIC,
  er_score NUMERIC,
  fsr_score NUMERIC,
  cpf_score NUMERIC,
  ifr_score NUMERIC,
  isr_score NUMERIC,
  isd_score NUMERIC,
  irn_score NUMERIC,
  eo_score NUMERIC,
  sus_score NUMERIC,
  overall_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only authenticated users (no anonymous access)
REVOKE ALL ON public.universities FROM anon;
