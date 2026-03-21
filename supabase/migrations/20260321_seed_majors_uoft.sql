INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', 10.0, 'Supplemental application required; strong math background in calculus and linear algebra expected', 'QS #22 World (Computer Science)', 6.5, 89, NULL, NULL, 3.9, 'A*A*A', 38, NULL, 120, 65),
  ('Engineering Science', 15.0, 'Student profile required; outstanding grades in math, physics and chemistry; supplemental application with personal statement', 'QS #25 World (Engineering)', 6.5, 89, NULL, NULL, 3.9, 'A*A*A', 38, NULL, 120, 65),
  ('Rotman Commerce', 12.0, 'Supplemental application with written essays and video interview; leadership and extracurricular involvement assessed', 'QS #23 World (Business)', 6.5, 89, NULL, NULL, 3.8, 'A*AA', 37, NULL, 120, 65),
  ('Life Sciences', 40.0, 'No supplemental application; strong performance in biology and chemistry required for competitive specialist streams', 'QS #13 World (Life Sciences & Medicine)', 6.5, 89, NULL, NULL, 3.5, 'AAB', 32, NULL, 120, 65),
  ('Mechanical Engineering', 20.0, 'Student profile required; strong grades in advanced math and physics', 'QS #25 World (Engineering)', 6.5, 89, NULL, NULL, 3.8, 'A*AA', 36, NULL, 120, 65),
  ('Electrical and Computer Engineering', 18.0, 'Student profile required; strong math, physics and computing background expected', 'QS #25 World (Engineering)', 6.5, 89, NULL, NULL, 3.8, 'A*AA', 37, NULL, 120, 65),
  ('Economics', 35.0, 'No supplemental application for admission to Social Sciences; specialist stream in economics is competitive with internal GPA requirements', 'QS #24 World (Economics)', 6.5, 89, NULL, NULL, 3.6, 'AAB', 34, NULL, 120, 65),
  ('Psychology', 38.0, 'No supplemental application; admission through Social Sciences or Life Sciences stream; specialist program has internal GPA requirements', 'QS #13 World (Psychology)', 6.5, 89, NULL, NULL, 3.5, 'AAB', 33, NULL, 120, 65),
  ('Mathematics', 30.0, 'No supplemental application; strong performance in calculus, advanced functions and linear algebra expected', 'QS #20 World (Mathematics)', 6.5, 89, NULL, NULL, 3.7, 'AAA', 35, NULL, 120, 65),
  ('Political Science', 40.0, 'No supplemental application; admission through Social Sciences or Humanities stream', 'QS #14 World (Social Sciences)', 6.5, 89, NULL, NULL, 3.5, 'ABB', 32, NULL, 120, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Toronto';
