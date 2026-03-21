INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', '7%', 'Weinberg College of Arts and Sciences; Northwestern writing supplement required', 15, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null::integer),
  ('Psychology', '7%', 'Weinberg College of Arts and Sciences; Northwestern writing supplement required', 8, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Journalism', '7%', 'Medill School of Journalism; supplemental essay on interest in journalism required', 1, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Biology', '7%', 'Weinberg College of Arts and Sciences; Northwestern writing supplement required', 20, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Computer Science', '7%', 'McCormick School of Engineering; Northwestern writing supplement and ''Why McCormick'' essay required', 139, 7.5, 105, 1500, 34, 3.9, 'A*A*A', 38, 99.0, 130, null),
  ('Neuroscience', '7%', 'Weinberg College of Arts and Sciences; Northwestern writing supplement required', null, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Political Science', '7%', 'Weinberg College of Arts and Sciences; Northwestern writing supplement required', 30, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Information Science', '7%', 'McCormick School of Engineering or School of Communication; Northwestern writing supplement required', null, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Theatre', '7%', 'School of Communication; audition or portfolio required; supplemental artistic materials', 21, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null),
  ('Communications', '7%', 'School of Communication; Northwestern writing supplement required', 3, 7.5, 105, 1490, 34, 3.9, 'A*AA', 38, 99.0, 130, null)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Northwestern University';
