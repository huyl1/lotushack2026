-- Seed: Politecnico di Milano (PoliMi)
-- Source: polimi.it official website, QS World Rankings 2025
-- Tuition converted at EUR 1 = USD 1.10 (max non-EU bracket ~€9,000 → ~$9,900)

UPDATE public.universities
SET
  website_url             = 'https://www.polimi.it',
  tuition_usd             = 9900,
  overall_acceptance_rate = '49%',
  test_policy             = 'Not applicable',
  deadline_calendar       = 'Round 1: April 2025; Round 2: July 2025 (September intake). Some programs have additional entrance exam (TOLC) requirements.',
  financial_aid           = 'Need-based DSU Lombardia regional grants (full tuition + living stipend for eligible students); PoliMi merit scholarships; income-based tuition banding (fees from ~€900 to ~€9,000/year depending on ISEE income bracket)'
WHERE name = 'Politecnico di Milano';

-- Top 10 majors for Politecnico di Milano
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, null, null, v.gpa_min, v.a_level_grades, v.ib_min, null, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science and Engineering',  null::text, null::text,                                    51,    6.5::numeric, 80, null::numeric, 'BBB', 30, null::integer, 65),
  ('Mechanical Engineering',            null::text, null::text,                                    null,  6.0::numeric, 80, null::numeric, 'BBB', 28, null::integer, null),
  ('Architecture',                      null::text, 'Entrance exam TOLC-A or equivalent',         3,     6.5::numeric, 80, null::numeric, 'BBC', 28, null::integer, null),
  ('Industrial Design',                 null::text, 'Portfolio and entrance exam (TOLC-A)',        null,  6.5::numeric, 80, null::numeric, 'BBC', 28, null::integer, null),
  ('Aerospace Engineering',             null::text, null::text,                                    null,  6.0::numeric, 80, null::numeric, 'BBB', 28, null::integer, null),
  ('Civil Engineering',                 null::text, null::text,                                    null,  6.0::numeric, 80, null::numeric, 'BBC', 28, null::integer, null),
  ('Electrical Engineering',            null::text, null::text,                                    null,  6.0::numeric, 80, null::numeric, 'BBB', 28, null::integer, null),
  ('Chemical Engineering',              null::text, null::text,                                    null,  6.0::numeric, 80, null::numeric, 'BBB', 28, null::integer, null),
  ('Mathematical Engineering',          null::text, null::text,                                    null,  6.5::numeric, 80, null::numeric, 'ABB', 30, null::integer, null),
  ('Management Engineering',            null::text, null::text,                                    null,  6.5::numeric, 80, null::numeric, 'BBB', 29, null::integer, null)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, gpa_min, a_level_grades, ib_min, duolingo_min, pte_min)
WHERE u.name = 'Politecnico di Milano';
