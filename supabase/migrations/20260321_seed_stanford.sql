-- Part 1: University-level data for Stanford University
UPDATE public.universities SET
  website_url = 'https://www.stanford.edu',
  tuition_usd = 67731,
  overall_acceptance_rate = '3.9%',
  test_policy = 'Test-optional (SAT or ACT accepted but not required for 2025-2026 admission cycle; self-reported scores accepted during application, official scores required upon enrollment)',
  deadline_calendar = 'Restrictive Early Action (REA): November 1 (notification mid-December). Regular Decision (RD): January 2 (notification late March/early April). Common Application, Coalition Application, or QuestBridge Application accepted. Mid-year school report and final school report required. Financial aid application deadline: same as admission deadlines (CSS Profile + FAFSA for US citizens/permanent residents; CSS Profile + ISFAA for international students).',
  financial_aid = 'Need-blind admissions for all applicants including international students. 100% of demonstrated financial need met for all admitted students. Families with annual income below $100,000 and typical assets pay zero tuition, room, board, and mandatory fees. Families with annual income below $150,000 and typical assets pay zero tuition. No student loans required in financial aid packages — all aid is grants and work-study. Over 70% of undergraduates receive some form of financial aid. Average scholarship grant exceeds $70,000 per year. Stanford Knight-Hennessy Scholars program available for graduate study.'
WHERE name = 'Stanford University';

-- Part 2: Top 10 majors for Stanford University
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Stanford University');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', '3.9%', 'Stanford supplemental short essays required (3 short essays on intellectual vitality, meaningful experiences, and what matters most); no prerequisite courses but strong math/science background expected', 1, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Economics', '3.9%', 'Stanford supplemental short essays required; no prerequisite courses required but strong quantitative background recommended', 5, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Human Biology', '3.9%', 'Stanford supplemental short essays required; interdisciplinary program combining biology, social sciences, and humanities; no prerequisite courses but strong science background recommended', 2, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Management Science and Engineering', '3.9%', 'Stanford supplemental short essays required; housed in School of Engineering; strong math and analytical background expected', 2, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Symbolic Systems', '3.9%', 'Stanford supplemental short essays required; interdisciplinary program spanning computer science, philosophy, linguistics, and psychology; strong analytical background recommended', 3, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Mechanical Engineering', '3.9%', 'Stanford supplemental short essays required; strong math and physics background expected; admitted to university not major — declaration after enrollment', 2, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Electrical Engineering', '3.9%', 'Stanford supplemental short essays required; strong math and physics background expected; admitted to university not major — declaration after enrollment', 3, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Biology', '3.9%', 'Stanford supplemental short essays required; strong science background recommended; admitted to university not major — declaration after enrollment', 2, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('International Relations', '3.9%', 'Stanford supplemental short essays required; interdisciplinary program; strong interest in global affairs and policy demonstrated through essays', 2, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70),
  ('Mathematics', '3.9%', 'Stanford supplemental short essays required; very strong math background expected; math competition experience valued but not required', 4, 7.0, 100, 1510, 34, 3.95, 'A*A*A', 39, NULL::NUMERIC, 120, 70)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Stanford University';
