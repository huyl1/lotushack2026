-- Part 1: Update University of California, Berkeley (UCB) record
UPDATE public.universities
SET
  website_url = 'https://admissions.berkeley.edu',
  tuition_usd = 60140,
  overall_acceptance_rate = '11%',
  test_policy = 'Test Free',
  deadline_calendar = 'Regular Decision: Dec 1 (no Early Decision/Early Action)',
  financial_aid = 'Federal and state aid not available to international students; limited institutional need-based grants via Berkeley International Office; merit-based Regents'' and Chancellor''s Scholarship automatically considered for all admitted undergrads; California residents eligible for Blue and Gold Opportunity Plan covering tuition if family income under $80,000/yr'
WHERE name = 'University of California, Berkeley (UCB)';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'University of California, Berkeley (UCB)');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Electrical Engineering and Computer Sciences (EECS)', '7%', 'Apply to College of Engineering; EECS is one of the most competitive programs; holistic review with emphasis on math and science coursework rigor; UC is test-free, no SAT/ACT considered', 3, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.9, 'A*AA', 38, NULL::NUMERIC, 120, 65),
  ('Computer Science (L&S)', '3%', 'Apply through College of Letters & Science; extremely competitive due to impaction; strong math and programming background expected; holistic review; UC is test-free', 4, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.9, 'A*AA', 38, NULL::NUMERIC, 120, 65),
  ('Business Administration (Haas)', '26%', 'Apply to Haas School of Business for junior-year entry; freshmen apply undeclared then petition into Haas after two years; strong GPA and leadership profile required; UC is test-free', 7, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 36, NULL::NUMERIC, 120, 65),
  ('Economics', '16%', 'Apply through College of Letters & Science; impacted major; strong quantitative coursework expected; holistic review; UC is test-free', 6, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 36, NULL::NUMERIC, 120, 65),
  ('Mechanical Engineering', '27%', 'Apply to College of Engineering; strong math and physics coursework expected; holistic review; UC is test-free', 6, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.8, 'AAA', 37, NULL::NUMERIC, 120, 65),
  ('Data Science', '11%', 'Apply through College of Computing, Data Science, and Society; new interdisciplinary program; strong math and statistics background valued; UC is test-free', 1, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.8, 'AAA', 37, NULL::NUMERIC, 120, 65),
  ('Molecular and Cell Biology', '15%', 'Apply through College of Letters & Science; pre-med pathway popular; strong biology and chemistry coursework expected; holistic review; UC is test-free', 5, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.8, 'AAA', 37, NULL::NUMERIC, 120, 65),
  ('Political Science', '18%', 'Apply through College of Letters & Science; holistic review emphasising essays and personal insight questions; writing and critical thinking skills valued; UC is test-free', 9, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 36, NULL::NUMERIC, 120, 65),
  ('Psychology', '14%', 'Apply through College of Letters & Science; holistic review; research experience and lab involvement valued; strong science and writing background expected; UC is test-free', 11, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 36, NULL::NUMERIC, 120, 65),
  ('Environmental Science, Policy, and Management', '13%', 'Apply through College of Natural Resources; interdisciplinary program combining natural and social sciences; field experience and community involvement valued; UC is test-free', 8, 7.0, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 36, NULL::NUMERIC, 120, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of California, Berkeley (UCB)';
