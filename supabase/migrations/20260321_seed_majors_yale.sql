-- Part 1: Update Yale University record
UPDATE public.universities SET
  website_url = 'https://www.yale.edu',
  tuition_usd = 69900,
  overall_acceptance_rate = '4.6%',
  test_policy = 'Test Required',
  deadline_calendar = 'semester',
  financial_aid = 'Need-blind for all applicants including international; meets 100% of demonstrated financial need; no loans in aid packages; average grant ~$68,000'
WHERE name = 'Yale University';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Yale University');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #7 World (Economics & Econometrics); THE #9 (Business & Economics)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Political Science', '4.6%', 'Yale-specific supplemental essays and short answers required', 'THE #8 World (Social Sciences); QS Top 10 (Politics)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Computer Science', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #26 World (Computer Science); THE #27', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('History', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #4 World (History); THE #9 (Arts & Humanities)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Molecular, Cellular, and Developmental Biology', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #10 World (Biological Sciences); THE #6 (Life Sciences)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Mathematics', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS Top 20 World (Mathematics); THE #14 (Physical Sciences)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Global Affairs', '4.6%', 'Yale-specific supplemental essays and short answers required; Jackson School of Global Affairs interdisciplinary program', 'THE #8 World (Social Sciences)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Psychology', '4.6%', 'Yale-specific supplemental essays and short answers required', 'THE #7 World (Psychology); QS Top 15 (Psychology)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('English', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #6 World (English Language & Literature); THE #9 (Arts & Humanities)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70),
  ('Statistics and Data Science', '4.6%', 'Yale-specific supplemental essays and short answers required', 'QS #9 World (Data Science & AI)', 7.0, 100, 1500, 33, 3.9, 'A*A*A', 38, NULL, 120, 70)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Yale University';
