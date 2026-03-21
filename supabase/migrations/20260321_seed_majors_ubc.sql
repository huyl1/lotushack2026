-- Update university data for University of British Columbia
-- Sources:
--   Tuition: https://students.ubc.ca/finances/tuition-fees/undergraduate-tuition-fees/ (2026/27)
--     International Arts full load = CAD $51,530. CAD→USD at 0.74 ≈ $38,100 USD (representative mid-range)
--   Acceptance rate: UBC Annual Enrolment Report 2024/25 — UBCV admitted 27,647 of 43,992 = 62.8%
--   Test policy: UBC does not use SAT/ACT; admissions based on grades + Personal Profile
--   Deadline: January 15 (rolling decisions after; semester-based)
--   Financial aid: Entrance scholarships, bursaries, and awards available (domestic & international)

UPDATE public.universities
SET
  website_url              = 'https://www.ubc.ca',
  tuition_usd              = 38100,
  overall_acceptance_rate  = '63%',
  test_policy              = 'Not Required',
  deadline_calendar        = 'January 15 (Rolling)',
  financial_aid            = 'Yes'
WHERE name = 'University of British Columbia';

-- Replace majors
DELETE FROM public.majors
WHERE university_id = (SELECT id FROM public.universities WHERE name = 'University of British Columbia');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science',        '20%', 'Personal Profile required. Requires Pre-Calculus 12 or equivalent. Competitive average in high 80s–low 90s. SAT/ACT not used.',                                             'QS #51-100 (Computer Science & Information Systems)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA including Mathematics',             32, 93.00, 125, 65),
  ('Commerce (Sauder)',       '15%', 'Personal Profile with written responses and video interview required. Supplemental application fee. Strong extracurriculars and leadership expected. SAT/ACT not used.',    'QS #30 (Marketing), THE #29 (Business & Economics)',  6.5, 90, NULL,           NULL,           3.7, 'AAA',                                   33, 93.00, 125, 65),
  ('Engineering',             '35%', 'Personal Profile required. Requires Physics 12, Chemistry 12, Pre-Calculus 12, and Calculus 12 or equivalents. Competitive average 90%+. SAT/ACT not used.',              'QS #25 (Civil & Structural Engineering)',              6.5, 90, NULL,           NULL,           3.7, 'AAA including Mathematics and Physics', 33, 95.00, 125, 65),
  ('Biology',                 '52%', 'No supplemental application. Requires Chemistry 11 and one of Biology 11 or Physics 11. Admitted through Faculty of Science. SAT/ACT not used.',                          'QS #41 (Biological Sciences)',                        6.5, 90, NULL,           NULL,           3.3, 'ABB including one Science',             28, 85.00, 125, 65),
  ('Psychology',              '52%', 'No supplemental application. Admitted through Faculty of Arts. SAT/ACT not used.',                                                                                        'THE #17 (Psychology)',                                6.5, 90, NULL,           NULL,           3.3, 'ABB',                                  26, 85.00, 125, 65),
  ('International Relations', '52%', 'No supplemental application. Admitted through Faculty of Arts. Interdisciplinary program combining political science, history, economics, and languages. SAT/ACT not used.', 'THE #28 (Social Sciences)',                          6.5, 90, NULL,           NULL,           3.3, 'ABB',                                  26, 85.00, 125, 65),
  ('Economics',               '52%', 'No supplemental application. Admitted through Faculty of Arts. Pre-Calculus 12 recommended. SAT/ACT not used.',                                                           'QS #51-100 (Economics & Econometrics)',               6.5, 90, NULL,           NULL,           3.3, 'ABB including Mathematics',            26, 85.00, 125, 65),
  ('Nursing',                 '25%', 'Competitive entry after first year of university. Requires Biology 12 and Chemistry 12. Personal Profile and interview may be required. SAT/ACT not used.',                'QS #26 (Nursing)',                                    6.5, 90, NULL,           NULL,           3.7, 'AAB including Biology and Chemistry',  30, 90.00, 125, 65),
  ('Kinesiology',             '40%', 'Personal Profile required. Requires Biology 11 or 12 and one of Chemistry 11 or Physics 11. SAT/ACT not used.',                                                           'QS #5 (Sports-related Subjects)',                     6.5, 90, NULL,           NULL,           3.5, 'ABB including one Science',            28, 88.00, 125, 65),
  ('Media Studies',           '52%', 'No supplemental application. Admitted through Faculty of Arts. SAT/ACT not used.',                                                                                        'QS #51-100 (Communication & Media Studies)',          6.5, 90, NULL,           NULL,           3.3, 'ABB',                                  26, 85.00, 125, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of British Columbia';
