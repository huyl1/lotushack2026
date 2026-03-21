INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Psychology', 9.3, 'College of Letters & Science; four UC Personal Insight Questions required', 'QS #7 World (2025); US News #6', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Business Economics', 9.3, 'College of Letters & Science (Social Sciences division); four UC Personal Insight Questions required; pre-major requirements in economics and math', 'QS #38 US News (Economics & Business)', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Political Science', 9.3, 'College of Letters & Science (Social Sciences division); four UC Personal Insight Questions required', 'QS #11 US News; THE #14 (Social Sciences)', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Biology', 11.0, 'College of Letters & Science (Life Sciences division); four UC Personal Insight Questions required', 'QS #12 World (Biological Sciences, 2025); US News #11', 7.5, 100, NULL, NULL, 4.44, 'AAA', 36, 97.0, 130, NULL),
  ('Psychobiology', 11.0, 'College of Letters & Science (Life Sciences division); four UC Personal Insight Questions required', 'QS #7 World (Psychology, 2025); US News #6', 7.5, 100, NULL, NULL, 4.44, 'AAA', 36, 97.0, 130, NULL),
  ('Sociology', 9.3, 'College of Letters & Science (Social Sciences division); four UC Personal Insight Questions required', 'US News #6', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Economics', 9.3, 'College of Letters & Science (Social Sciences division); four UC Personal Insight Questions required', 'QS #38 US News (Economics & Business); US News #11 (Economics)', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Computer Science', 7.3, 'Samueli School of Engineering application; four UC Personal Insight Questions required; strong math and science background expected', 'THE #18 (Computer Science); QS #22 (2025)', 7.5, 100, NULL, NULL, 4.64, 'A*A*A', 38, 99.0, 130, NULL),
  ('Cognitive Science', 9.3, 'College of Letters & Science (Social Sciences division); four UC Personal Insight Questions required', 'Interdisciplinary; UCLA ranked QS #7 World in Psychology', 7.5, 100, NULL, NULL, 4.41, 'AAA', 36, 97.0, 130, NULL),
  ('Molecular, Cell and Developmental Biology', 11.0, 'College of Letters & Science (Life Sciences division); four UC Personal Insight Questions required', 'QS #12 World (Biological Sciences, 2025); US News #17 (Cell Biology)', 7.5, 100, NULL, NULL, 4.44, 'AAA', 36, 97.0, 130, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of California, Los Angeles (UCLA)';
