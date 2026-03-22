-- Migration: university_embeddings
-- Stores one embedding vector per university row, derived from the
-- universities.csv crawler output.  All admissions fields are text (raw
-- scraped prose); numeric/special types are kept for qs_rank, tuition_usd,
-- scraped_at, and the search_embedding vector itself.
--
-- search_embedding: 1024-dim voyage-3 vector (pgvector extension required)

create extension if not exists vector with schema extensions;

create table if not exists public.university_embeddings (
  -- Primary key (same deterministic uuid5 used by the crawler pipeline)
  id                              uuid        not null,

  -- Core identity
  name                            text        not null,
  country                         text        null,
  qs_rank                         integer     null,
  ranking_year                    text        null,
  website_url                     text        null,
  scraped_at                      timestamptz null,

  -- Campus character
  setting                         text        null,
  size_category                   text        null,
  top10_topic                     text        null,

  -- Financials
  tuition_usd                     numeric(14, 2) null,
  tuition_fees                    text        null,  -- raw scraped text

  -- Admissions — acceptance
  overall_acceptance_rate         text        null,
  program_specific_acceptance_rate text       null,
  acceptance_rate_by_residency    text        null,
  acceptance_rate_by_round        text        null,
  selectivity_trend               text        null,
  yield_rate                      text        null,
  deferral_waitlist_indicators    text        null,

  -- Admissions — tests & requirements
  test_policy                     text        null,
  english_test_requirements       text        null,
  application_pathways_eligibility text       null,
  program_supplemental_requirements text      null,
  transfer_deferred_entry_options text        null,
  major_impaction_signals         text        null,

  -- Admissions — deadlines & profiles
  deadline_calendar               text        null,
  admitted_gpa_percentiles        text        null,
  admitted_sat_act_percentiles    text        null,
  class_profile_composition       text        null,

  -- Financial aid
  need_policy                     text        null,
  scholarship_deadlines_eligibility text      null,
  average_aid_merit_statistics    text        null,

  -- Embedding vector (voyage-3 → 1024 dimensions)
  search_embedding                vector(1024) null,

  constraint university_embeddings_pkey primary key (id)
) tablespace pg_default;

-- ANN index for cosine-similarity search (ivfflat; tune lists after bulk load)
create index if not exists university_embeddings_embedding_idx
  on public.university_embeddings
  using ivfflat (search_embedding vector_cosine_ops)
  with (lists = 100)
  tablespace pg_default;

-- Supporting btree indexes for filter + search patterns
create index if not exists university_embeddings_qs_rank_idx
  on public.university_embeddings using btree (qs_rank) tablespace pg_default;

create index if not exists university_embeddings_country_idx
  on public.university_embeddings using btree (country) tablespace pg_default;

create index if not exists university_embeddings_name_idx
  on public.university_embeddings using btree (name) tablespace pg_default;
