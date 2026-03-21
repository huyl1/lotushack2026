-- University of Bern (Switzerland) - university-level data and top 10 majors
-- Tuition: ~CHF 980/year (~USD 1,100 at CHF/USD 1.12)
-- Swiss public university; most programs taught in German; no SAT/ACT/ATAR

-- Part 1: Update university-level data
UPDATE public.universities
SET
  website_url            = 'https://www.unibe.ch/index_eng.html',
  tuition_usd            = 1100,
  overall_acceptance_rate= '55%',
  test_policy            = 'Not applicable',
  deadline_calendar      = 'Winter semester: April 30 for non-EU (visa required), June 30 for EU/EFTA; Summer semester: October 31',
  financial_aid          = 'University of Bern Excellence Masters/PhD scholarships; Swiss Government Excellence Scholarships for non-EU; ESKAS scholarships'
WHERE name = 'University of Bern';

-- Part 2: Insert top 10 majors
INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
SELECT
  u.id,
  v.major_name,
  v.acceptance_rate::text,
  v.supplemental_requirements::text,
  v.subject_ranking::integer,
  v.ielts_min::numeric,
  v.toefl_min::integer,
  null::integer,   -- sat_min (not applicable)
  null::integer,   -- act_min (not applicable)
  null::numeric,   -- gpa_min
  null::text,      -- a_level_grades
  v.ib_min::integer,
  null::numeric,   -- atar_min (not applicable)
  null::integer,   -- duolingo_min
  null::integer    -- pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine',         null::text, null::text, null::integer, 7.0::numeric, 100::integer, 36::integer),
  ('Law',              null::text, null::text, null::integer, 6.5::numeric,  90::integer, 32::integer),
  ('Economics',        null::text, null::text, null::integer, 6.5::numeric,  90::integer, 30::integer),
  ('Computer Science', null::text, null::text, null::integer, 6.5::numeric,  90::integer, 30::integer),
  ('Physics',          null::text, null::text, null::integer, 6.5::numeric,  90::integer, 30::integer),
  ('Chemistry',        null::text, null::text, null::integer, 6.5::numeric,  90::integer, 30::integer),
  ('Biology',          null::text, null::text, null::integer, 6.5::numeric,  90::integer, 30::integer),
  ('Psychology',       null::text, null::text, null::integer, 6.5::numeric,  90::integer, 32::integer),
  ('History',          null::text, null::text, null::integer, 6.0::numeric,  85::integer, 28::integer),
  ('Philosophy',       null::text, null::text, null::integer, 6.0::numeric,  85::integer, 28::integer)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, ib_min)
WHERE u.name = 'University of Bern';
