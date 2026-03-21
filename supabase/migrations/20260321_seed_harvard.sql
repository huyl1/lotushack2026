-- Update Harvard University university-level data
UPDATE public.universities SET
  website_url = 'https://college.harvard.edu/admissions',
  tuition_usd = 61488,
  overall_acceptance_rate = '3.0%',
  test_policy = 'Required',
  deadline_calendar = 'REA: November 1; RD: January 1; Financial Aid: February 1',
  financial_aid = 'Need-blind for all applicants (domestic and international). Meets 100% of demonstrated need with no loans. Families earning under $85,000/year pay nothing. Over 55% of students receive Harvard scholarships. Average grant: ~$76,000/year.'
WHERE name = 'Harvard University';

-- Delete existing majors for Harvard University
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Harvard University');

-- Insert top 10 majors for Harvard University
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Computer Science', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 4, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Government', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 3, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Applied Mathematics', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Neuroscience', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 4, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('History', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Statistics', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Psychology', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 2, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Sociology', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75),
  ('Biology (Human Evolutionary Biology)', '3.0%', 'Harvard supplement essay, 2 teacher recommendations, school report, interview (recommended), SAT/ACT required', 1, 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, NULL::numeric, 130, 75)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Harvard University';
