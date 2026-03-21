INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Bachelor of Medicine, Bachelor of Surgery (MBBS)', '5%', 'UCAT ANZ required; interview required; prerequisites: Chemistry and one of Biology/Physics/Maths; apply via VTAC', 58, 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'A*AA', 38, 99.15, 120, 65),
  ('Bachelor of Laws (LLB) with Bachelor of Arts', '10%', 'Apply via VTAC; no separate law admission test required in Victoria; prerequisites: completion of Year 12', 51, 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA', 36, 97.0, 120, 65),
  ('Bachelor of Engineering (Honours)', '30%', 'Prerequisites: Year 12 Mathematical Methods and one of Physics or Chemistry; 4-year honours program; apply via VTAC', 101, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 33, 90.0, 105, 58),
  ('Bachelor of Computer Science', '25%', 'Prerequisites: Year 12 Mathematical Methods recommended; strong demand from technology sector; apply via VTAC', 101, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 30, 85.0, 105, 58),
  ('Bachelor of Commerce', '35%', 'Prerequisites: Year 12 Mathematical Methods recommended; one of the most popular degrees at Monash; apply via VTAC', 101, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 30, 83.0, 105, 58),
  ('Bachelor of Pharmacy (Honours)', '15%', 'Prerequisites: Year 12 Chemistry and one of Biology or Mathematical Methods; 4-year honours program; apply via VTAC', 7, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 33, 90.0, 105, 58),
  ('Bachelor of Science', '40%', 'Prerequisites vary by specialisation; 20+ specialisations available including Biochemistry, Genetics, Physics; apply via VTAC', 101, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBB', 28, 75.0, 105, 58),
  ('Bachelor of Nursing', '35%', 'Prerequisites: Year 12 Biology recommended; National Police Check required prior to clinical placement; apply via VTAC', 51, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBB', 28, 76.0, 105, 58),
  ('Bachelor of Psychology (Honours)', '20%', 'Prerequisites: Year 12 Mathematical Methods recommended; 4-year accredited honours program; apply via VTAC', 101, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 32, 88.0, 105, 58),
  ('Bachelor of Arts', '50%', 'No specific prerequisites; flexible double-degree options; widest choice of majors in humanities and social sciences; apply via VTAC', NULL::INTEGER, 6.5, 79, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBC', 24, 70.0, 105, 58)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Monash University';
