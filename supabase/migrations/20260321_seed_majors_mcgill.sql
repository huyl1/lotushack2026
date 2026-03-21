INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
SELECT
  u.id,
  v.major_name, v.acceptance_rate, v.supplemental_requirements,
  v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min,
  v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', null, 'Mathematics prerequisites required', 30, 6.5, 90, null, null, 3.8, 'A*AA', 38, null, 125, 65),
  ('Mechanical Engineering', null, 'Math, Chemistry, and Physics prerequisites required', 45, 6.5, 90, null, null, 3.7, 'A*A*A', 39, null, 125, 65),
  ('Commerce (Desautels)', null, 'Supplemental essays required; Math prerequisite', 91, 6.5, 100, null, null, 3.7, 'AAA', 38, null, 130, 65),
  ('Biology', null, 'Math and two of Biology, Chemistry, or Physics required', 44, 6.5, 90, null, null, 3.5, 'AAA', 34, null, 125, 65),
  ('Psychology', null, null, 27, 6.5, 90, null, null, 3.5, 'AAA', 33, null, 125, 65),
  ('Political Science', null, null, 40, 6.5, 90, null, null, 3.5, 'AAA', 33, null, 125, 65),
  ('Economics', null, 'Mathematics prerequisite recommended', 91, 6.5, 90, null, null, 3.5, 'AAA', 33, null, 125, 65),
  ('Biomedical Engineering', null, 'Math, Chemistry, and Physics prerequisites required; highly competitive', 45, 6.5, 90, null, null, 3.8, 'A*A*A*A*', 40, null, 125, 65),
  ('Nursing', null, 'Resume, personal statement, and letters of recommendation required; Biology and Chemistry prerequisites', null, 6.5, 90, null, null, 3.5, 'AAA', 33, null, 125, 65),
  ('Music', null, 'Audition required', 14, 6.5, 79, null, null, 3.3, 'ABB', 28, null, 125, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking,
       ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades,
       ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'McGill University';
