-- Part 1: Update Tel Aviv University with website_url, tuition, and test_policy
-- Tuition: $15,500/year (BA Liberal Arts international program, per international.tau.ac.il)
-- NIS 11,970 domestic bachelor's tuition ~ $3,300 USD, but international English programs are priced in USD at $15,500
-- test_policy: Not applicable (SAT/ACT optional for international undergraduate programs)
UPDATE public.universities
SET
  website_url = 'https://international.tau.ac.il',
  tuition_usd = 15500,
  test_policy = 'Not applicable'
WHERE name = 'Tel Aviv University';

-- Part 2: Insert 10 undergraduate majors (English-taught international programs)
-- English proficiency: IELTS 6.5, TOEFL iBT 79, PTE 62, Duolingo not accepted/not listed
-- SAT/ACT optional (not required); ATAR not applicable for Israeli university
-- IB min: 24 points (no minimum average required when IB Diploma 24+ is presented)
-- GPA min: 3.0 (Management & Liberal Arts program requires 3.0; Liberal Arts requires 80% average)
-- A-level: accepted (no specific grade minimum stated beyond general admission selectivity)
-- acceptance_rate: TAU overall ~30% for international programs (selective but accessible)
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('BA in Liberal Arts', NULL, 'Personal essay (300-500 words), two letters of recommendation, high school transcript; SAT/ACT optional', 'QS #201-250 (Arts & Humanities)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BA in Management and Liberal Arts', NULL, 'Personal essay, two letters of recommendation, CV/resume, high school transcript with GPA 3.0+; math proficiency equivalent to AP Calculus AB (min grade 90) required', 'QS #201-250 (Business & Management)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('Dual Degree BA/BA with Columbia University (Liberal Arts)', NULL, 'Personal essay, two letters of recommendation, high school transcript; Duolingo accepted for Dual Degree Columbia track', 'QS #201-250 (Arts & Humanities)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, 105, 62),
  ('BSc in Computer Science', NULL, 'High school transcript; strong mathematics background required; Hebrew language studies in preparatory year for Olim integration track', 'QS #151-200 (Computer Science & Information Systems)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BSc in Electrical Engineering', NULL, 'High school transcript; preparatory year with intensive Hebrew and math/physics courses in English for international track', 'QS #251-300 (Engineering - Electrical & Electronic)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BSc in Mechanical Engineering', NULL, 'High school transcript; preparatory year with intensive Hebrew and math/physics courses in English for international track', 'QS #251-300 (Engineering - Mechanical)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BA in Psychology (Liberal Arts Track)', NULL, 'Personal essay, two letters of recommendation, high school transcript; psychology track selected as part of Liberal Arts program', 'QS #151-200 (Psychology)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BA in Philosophy (Liberal Arts Track)', NULL, 'Personal essay, two letters of recommendation, high school transcript; philosophy track selected as part of Liberal Arts program', 'QS #201-250 (Philosophy)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BA in Middle Eastern Studies (Liberal Arts Track)', NULL, 'Personal essay, two letters of recommendation, high school transcript; Middle Eastern Studies track selected as part of Liberal Arts program', 'QS #51-100 (Area Studies)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62),
  ('BA in Digital Culture and Communications (Liberal Arts Track)', NULL, 'Personal essay, two letters of recommendation, high school transcript; Digital Culture and Communications track selected as part of Liberal Arts program', 'QS #201-250 (Communication & Media Studies)', 6.5, 79, NULL, NULL, 3.0, NULL, 24, NULL, NULL, 62)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Tel Aviv University';
