-- Wide universities row: one column per admissions-searchable parameter (VNG list + tuition).
-- Values are mostly free text from Exa; use nullable columns when a scrape omits a field.
-- See python/APPLYING_PARAMS.md section 2 for parameter semantics.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity & QS context
  name text NOT NULL,
  country text,
  qs_rank integer,
  website_url text,
  setting text,
  size_category text,
  ranking_year text,
  top10_topic text,
  scraped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Optional semantic search / RAG (populate in app; dimension matches OpenAI text-embedding-3-small @ 1536)
  search_embedding vector(1536),

  -- Institutional / numeric (for filters)
  tuition_usd numeric(14, 2),

  -- 2A — High coverage (internet-searchable)
  overall_acceptance_rate text,
  test_policy text,
  english_test_requirements text,
  application_pathways_eligibility text,
  deadline_calendar text,
  program_supplemental_requirements text,
  transfer_deferred_entry_options text,

  -- 2B — Medium coverage
  program_specific_acceptance_rate text,
  acceptance_rate_by_residency text,
  admitted_gpa_percentiles text,
  admitted_sat_act_percentiles text,
  need_policy text,
  class_profile_composition text,
  selectivity_trend text,
  scholarship_deadlines_eligibility text,

  -- 2C — Lower coverage / inconsistent
  acceptance_rate_by_round text,
  major_impaction_signals text,
  average_aid_merit_statistics text,
  yield_rate text,
  deferral_waitlist_indicators text,

  -- Explicitly called out in Exa crawler prompt (alongside VNG list)
  tuition_fees text
);

COMMENT ON TABLE public.universities IS
  'One row per university; wide columns map to VNG admissions parameters (APPLYING_PARAMS.md).';

CREATE INDEX universities_qs_rank_idx ON public.universities (qs_rank);

CREATE INDEX universities_country_idx ON public.universities (country);

CREATE INDEX universities_name_idx ON public.universities (name);

-- Future program-level rows (not populated by current Exa top10 JSON; for separate ingest).
CREATE TABLE public.majors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.universities (id) ON DELETE CASCADE,
  major_name text NOT NULL,
  degree_type text,
  ranking_within_school integer,
  source_url text,
  scraped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX majors_university_id_idx ON public.majors (university_id);

CREATE INDEX majors_major_name_idx ON public.majors (major_name);

CREATE TABLE public.crawl_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities (id) ON DELETE SET NULL,
  error_stage text,
  message text NOT NULL,
  detail jsonb,
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX crawl_errors_university_id_idx ON public.crawl_errors (university_id);

CREATE INDEX crawl_errors_created_at_idx ON public.crawl_errors (created_at DESC);

-- Keep updated_at fresh (optional; call from app or triggers)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER universities_set_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();
