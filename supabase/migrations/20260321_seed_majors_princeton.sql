INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', 4.5, 'Senior thesis required; must complete multivariable calculus and linear algebra; econometrics coursework required', 'QS #5 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Computer Science', 4.5, 'Senior thesis or independent work required; BSE track requires additional math and science prerequisites', 'QS #13 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Public and International Affairs', 4.5, 'Admission to SPIA by end of sophomore year; policy task force or thesis required; quantitative and language proficiency expected', 'QS #3 World (Politics)', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('History', 4.5, 'Senior thesis required; two junior papers required; reading knowledge of a foreign language expected', 'QS #9 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Mechanical and Aerospace Engineering', 4.5, 'BSE degree track; must complete core engineering and math sequences including thermodynamics and fluid mechanics', 'QS #35 World (Engineering)', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Molecular Biology', 4.5, 'Senior thesis with laboratory research required; organic chemistry, biochemistry, and genetics prerequisites', 'QS #24 World (Biological Sciences)', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Politics', 4.5, 'Senior thesis required; two junior papers required; coursework across comparative, international, American, and political theory subfields', 'QS #3 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Sociology', 4.5, 'Senior thesis required; statistics and research methods coursework required', 'QS #8 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Electrical and Computer Engineering', 4.5, 'BSE degree track; must complete core engineering, math, and physics sequences; independent research project required', 'QS #13 World (CS)', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70),
  ('Mathematics', 4.5, 'Senior thesis required; must complete real analysis, abstract algebra, and topology sequences', 'QS #7 World', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 42, 99.0, 120, 70)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Princeton University';
