-- Part 1: Update Cornell University record
UPDATE public.universities
SET
  website_url = 'https://www.cornell.edu',
  tuition_usd = 71266,
  overall_acceptance_rate = '8.4%',
  test_policy = 'Test Required',
  deadline_calendar = 'Early Decision: Nov 1; Regular Decision: Jan 2',
  financial_aid = 'Need-based only; meets 100% of demonstrated need; no merit scholarships; ~50% of undergrads receive institutional grants; families earning up to $75,000/yr have tuition, housing, and food covered'
WHERE name = 'Cornell University';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Cornell University');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', '6.73%', 'College of Engineering application; two teacher evaluations; supplemental essay on intellectual interests in chosen college; AP Calculus BC and AP Computer Science recommended', 6, 7.5, 100, 1530, 34, 3.9, NULL, 38, NULL, 130, 70),
  ('Electrical and Computer Engineering', '6.73%', 'College of Engineering application; strong math and physics coursework required; two teacher evaluations; AP Calculus BC and AP Physics C recommended', 10, 7.5, 100, 1520, 34, 3.9, NULL, 38, NULL, 130, 70),
  ('Mechanical Engineering', '6.73%', 'College of Engineering application; AP Calculus and AP Physics recommended; two teacher evaluations; supplemental essay on engineering interests', 12, 7.5, 100, 1510, 33, 3.9, NULL, 38, NULL, 130, 70),
  ('Applied Economics and Management (Dyson School)', '4.94%', 'SC Johnson College of Business / CALS application; supplemental essay on business and economics interests; two teacher evaluations; interview may be offered', 9, 7.5, 100, 1540, 34, 3.95, NULL, 39, NULL, 130, 70),
  ('Hotel Administration (Nolan School)', '17.97%', 'SC Johnson College of Business application; supplemental essay on hospitality career goals; interview strongly recommended; demonstrated interest in hospitality industry', 1, 7.5, 100, 1480, 33, 3.8, NULL, 36, NULL, 130, 70),
  ('Biology / Biological Sciences', '7.38%', 'College of Arts & Sciences application; writing supplement on intellectual interests; two teacher evaluations; AP Biology or AP Chemistry coursework recommended', 11, 7.5, 100, 1510, 33, 3.9, NULL, 37, NULL, 130, 70),
  ('Economics', '7.38%', 'College of Arts & Sciences application; supplemental essay on academic and intellectual interests; two teacher evaluations; strong math background recommended', 15, 7.5, 100, 1520, 33, 3.9, NULL, 37, NULL, 130, 70),
  ('Architecture', '9.04%', 'College of Architecture, Art and Planning application; portfolio of creative and design work required; video interview required; demonstrated interest in design and built environment', 8, 7.5, 100, 1490, 33, 3.85, NULL, 37, NULL, 130, 70),
  ('Industrial and Labor Relations (ILR)', '20.45%', 'ILR School application; supplemental essay on labor, work, and employment relations interests; two teacher evaluations; demonstrated engagement with social and policy issues', 1, 7.5, 100, 1490, 33, 3.85, NULL, 37, NULL, 130, 70),
  ('Animal Science (College of Agriculture and Life Sciences)', '14.70%', 'College of Agriculture and Life Sciences application; supplemental essay on agricultural or life sciences interests; two teacher evaluations; lab or research experience recommended', 5, 7.5, 100, 1480, 33, 3.8, NULL, 36, NULL, 130, 70)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Cornell University';
