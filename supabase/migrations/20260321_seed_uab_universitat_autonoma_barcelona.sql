-- Universitat Autónoma de Barcelona (UAB) — university data and top 10 majors
-- Tuition: ~€8,400/yr for non-EU undergraduates → ~$9,200 USD at 1.10 EUR/USD
-- Acceptance rate: ~45% (public Spanish university, relatively open admissions)
-- Test policy: Not applicable (Spanish system uses PAU/Selectividad/UNISG)
-- Psychology ranked #51 QS Subject Rankings 2024

-- Part 1: Update university-level data
UPDATE public.universities
SET
  website_url              = 'https://www.uab.cat/en/',
  tuition_usd              = 9200,
  overall_acceptance_rate  = '45%',
  test_policy              = 'Not applicable',
  deadline_calendar        = 'Non-EU international: apply by June 30 for September intake via UAB International Office. EU students via PAU/UNISG system.',
  financial_aid            = 'UAB scholarships, Generalitat de Catalunya grants, Erasmus+ for exchange students. Non-EU students eligible for Spanish Government scholarships.'
WHERE name = 'Universitat Autónoma de Barcelona';

-- Part 2: Insert top 10 majors
INSERT INTO public.majors (
  university_id,
  major_name,
  acceptance_rate,
  supplemental_requirements,
  subject_ranking,
  ielts_min,
  toefl_min,
  sat_min,
  act_min,
  gpa_min,
  a_level_grades,
  ib_min,
  atar_min,
  duolingo_min,
  pte_min
)
SELECT
  u.id,
  v.major_name,
  v.acceptance_rate,
  v.supplemental_requirements,
  v.subject_ranking,
  v.ielts_min,
  v.toefl_min,
  NULL,  -- sat_min (not applicable)
  NULL,  -- act_min (not applicable)
  NULL,  -- gpa_min
  NULL,  -- a_level_grades
  v.ib_min,
  NULL,  -- atar_min (not applicable)
  NULL,  -- duolingo_min
  NULL   -- pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine',                            '8%',  NULL, NULL, 7.0, 95, 36),
  ('Psychology',                          '15%', NULL,   51, 6.5, 90, 32),
  ('Computer Science',                    '25%', NULL, NULL, 6.5, 90, 30),
  ('Business Administration (ADE)',       '30%', NULL, NULL, 6.5, 90, 30),
  ('Law',                                 '25%', NULL, NULL, 6.5, 90, 30),
  ('Biology',                             '30%', NULL, NULL, 6.5, 90, 28),
  ('Economics',                           '30%', NULL, NULL, 6.5, 90, 30),
  ('Political Science and Administration','35%', NULL, NULL, 6.5, 90, 28),
  ('History',                             '40%', NULL, NULL, 6.0, 80, 28),
  ('Veterinary Science',                  '15%', NULL, NULL, 6.5, 90, 32)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, ib_min)
WHERE u.name = 'Universitat Autónoma de Barcelona';
