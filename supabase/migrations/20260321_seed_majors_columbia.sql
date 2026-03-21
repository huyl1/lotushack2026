INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', 3.9, 'Columbia-specific essays; Columbia College or SEAS application', 'QS #5 US', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Economics', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #9 US (Economics)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Political Science', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #8 US (Politics)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Psychology', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #14 US (Psychology)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('History', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #6 US (History)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Neuroscience and Behavior', 3.9, 'Columbia-specific essays; Columbia College application', 'THE #15 US (Life Sciences)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('English', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #8 US (English)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Applied Mathematics', 3.9, 'Columbia-specific essays; Columbia College or SEAS application; strong calculus background expected', 'QS #21 US (Mathematics)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Philosophy', 3.9, 'Columbia-specific essays; Columbia College application', 'QS #1 US (Philosophy)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73),
  ('Mechanical Engineering', 3.9, 'Columbia-specific essays; SEAS application; strong math and physics background required', 'QS #8 US (Engineering)', 7.5, 105, 1510, 34, 3.9, 'A*A*A', 39, 99.0, 135, 73)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Columbia University';
