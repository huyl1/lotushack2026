-- Part 1: Update university data
UPDATE public.universities SET
  website_url = 'https://www.jhu.edu',
  tuition_usd = 66670,
  overall_acceptance_rate = '6%',
  test_policy = 'Required',
  deadline_calendar = 'Early Decision: Nov 1; Regular Decision: Jan 3',
  financial_aid = 'Need-blind for domestic students; meets 100% of demonstrated need; average need-based package ~$67,159; 52% of first-year students receive need-based aid'
WHERE name = 'Johns Hopkins University';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Johns Hopkins University');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Cellular and Molecular Biology', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'QS #15 US (Biological Sciences)', 7.0, 100, 1520, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70),
  ('Computer Science', '6%', 'Whiting School of Engineering or Krieger School application; supplemental essays required', 'US News #16 (tied, Computer Science)', 7.0, 100, 1530, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70),
  ('Neuroscience', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'US News #8 (tied, Psychology & Neuroscience)', 7.0, 100, 1520, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70),
  ('Public Health Studies', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'QS #1 globally (Public Health)', 7.0, 100, 1520, 34, 3.9, 'A*AA', 38, 99.0, 120, 70),
  ('Biomedical Engineering', '6%', 'Whiting School of Engineering application; supplemental essays required', 'US News #1 (tied, Biomedical Engineering)', 7.0, 100, 1530, 34, 3.9, 'A*A*A', 39, 99.0, 120, 70),
  ('Chemical and Biomolecular Engineering', '6%', 'Whiting School of Engineering application; supplemental essays required', 'US News #24 (Chemical Engineering)', 7.0, 100, 1530, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70),
  ('Economics', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'US News #21 (tied, Economics)', 7.0, 100, 1520, 34, 3.9, 'A*AA', 38, 99.0, 120, 70),
  ('International Studies', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'Niche #10 US (International Relations)', 7.0, 100, 1520, 34, 3.9, 'A*AA', 37, 98.5, 120, 70),
  ('Applied Mathematics and Statistics', '6%', 'Krieger School of Arts & Sciences application; supplemental essays required', 'QS #63 World (Mathematics)', 7.0, 100, 1530, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70),
  ('Mechanical Engineering', '6%', 'Whiting School of Engineering application; supplemental essays required', 'US News #23 (Mechanical Engineering)', 7.0, 100, 1530, 34, 3.9, 'A*A*A', 38, 99.0, 120, 70)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Johns Hopkins University';
