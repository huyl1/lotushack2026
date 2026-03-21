-- Part 1: University-level data for Washington University in St. Louis
UPDATE public.universities SET
  website_url = 'https://admissions.wustl.edu/apply/first-year-applicants/',
  tuition_usd = 63548,
  overall_acceptance_rate = '~12%',
  test_policy = 'Test-optional (SAT/ACT optional; submitted scores considered)',
  deadline_calendar = 'ED I: Nov 1 (decisions mid-Dec); ED II: Jan 2 (decisions mid-Feb); RD: Jan 2 (decisions late Mar). Merit scholarship consideration: apply by ED I or ED II for strongest consideration. International students follow same deadlines.',
  financial_aid = 'Need-aware for international students. Need-based aid available to international students on limited basis. Washington University Scholarship: merit-based, $25k–full tuition per year. John B. Ervin Scholars, Danforth Scholars, Annika Rodriguez Scholars programs for diverse merit scholars. CSS Profile and FAFSA required for need-based aid. Olin Business School merit fellowships. Limited number of full-need international awards.'
WHERE name = 'Washington University in St. Louis';

-- Part 2: Top 10 majors for Washington University in St. Louis
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', 12.0, 'Arts & Sciences or Olin Business application via Common App; WashU-specific essays required (''Why WashU'' and activity essay); test-optional', 20, 7.0, 100, 1500, 34, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Computer Science', 10.0, 'McKelvey School of Engineering application via Common App; WashU-specific essays required; strong math background expected; test-optional', 30, 7.0, 100, 1520, 35, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Biology', 12.0, 'Arts & Sciences application via Common App; WashU-specific essays required; pre-med pathway popular; test-optional', 20, 7.0, 100, 1490, 33, 3.85, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Psychological & Brain Sciences', 12.0, 'Arts & Sciences application via Common App; WashU-specific essays required; interdisciplinary neuroscience and psychology program; test-optional', 15, 7.0, 100, 1490, 33, 3.85, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Finance', 10.0, 'Olin Business School application via Common App; WashU-specific essays required; direct admission to Olin as first-year; test-optional', 7, 7.0, 100, 1510, 34, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Biomedical Engineering', 10.0, 'McKelvey School of Engineering application via Common App; WashU-specific essays required; strong biology and math background; test-optional', 5, 7.0, 100, 1520, 35, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Political Science', 12.0, 'Arts & Sciences application via Common App; WashU-specific essays required; test-optional', 25, 7.0, 100, 1490, 33, 3.85, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Chemistry', 12.0, 'Arts & Sciences application via Common App; WashU-specific essays required; strong laboratory research opportunities; test-optional', 20, 7.0, 100, 1500, 34, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Mechanical Engineering', 12.0, 'McKelvey School of Engineering application via Common App; WashU-specific essays required; strong math and physics background expected; test-optional', 30, 7.0, 100, 1510, 34, 3.9, NULL, 36, NULL::NUMERIC, 120, NULL::INTEGER),
  ('Art History', 12.0, 'Sam Fox School of Design & Visual Arts or Arts & Sciences application via Common App; WashU-specific essays required; portfolio not required for Art History; test-optional', NULL, 7.0, 100, 1480, 33, 3.85, NULL, 35, NULL::NUMERIC, 120, NULL::INTEGER)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Washington University in St. Louis';
