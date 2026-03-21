-- Part 1: Update university info for Universiti Putra Malaysia (UPM)
UPDATE public.universities
SET
  website_url = 'https://www.upm.edu.my',
  tuition_usd = 8400,
  overall_acceptance_rate = '40%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Intake 1 (Feb): Oct 31; Intake 2 (Jul): Apr 30 (international)',
  financial_aid = 'UPM International Student Scholarship covers partial tuition fees for high-achieving international students. UPM Graduate Excellence Award available. Government-to-government scholarships (MARA, JPA) for eligible nationalities.'
WHERE name = 'Universiti Putra Malaysia (UPM)';

-- Part 2: Insert 10 undergraduate majors for UPM
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Agriculture Science',                 '35%', 'Personal statement; certified academic transcripts; proof of English proficiency; interview may be required for international applicants',                        NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including Biology or Chemistry', 26, NULL::NUMERIC, 100, 55),
  ('Computer Science',                    '30%', 'Personal statement; certified academic transcripts; proof of English proficiency; relevant mathematics background required',                                      NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including Mathematics',          26, NULL::NUMERIC, 100, 55),
  ('Electrical & Electronic Engineering', '30%', 'Personal statement; certified academic transcripts; proof of English proficiency; Mathematics and Physics background required',                                   NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 3.0::NUMERIC, 'BCC including Mathematics and Physics', 26, NULL::NUMERIC, 100, 55),
  ('Environmental Science',               '40%', 'Personal statement; certified academic transcripts; proof of English proficiency; Biology or Chemistry recommended',                                             NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including one Science',           26, NULL::NUMERIC, 100, 55),
  ('Business Administration',             '40%', 'Personal statement; certified academic transcripts; proof of English proficiency; interview may be required',                                                   NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC',                                 26, NULL::NUMERIC, 100, 55),
  ('Veterinary Medicine',                 '20%', 'Personal statement; academic transcripts; Biology and Chemistry required; interview required; pre-clinical health check; strong science background expected',    NULL::INTEGER, 6.5::NUMERIC, 90, NULL::INTEGER, NULL::INTEGER, 3.3::NUMERIC, 'ABB including Biology and Chemistry', 30, NULL::NUMERIC, 105, 58),
  ('Biotechnology',                       '35%', 'Personal statement; certified academic transcripts; proof of English proficiency; Biology and Chemistry recommended',                                            NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including Biology',               26, NULL::NUMERIC, 100, 55),
  ('Food Science & Technology',           '40%', 'Personal statement; certified academic transcripts; proof of English proficiency; Chemistry or Biology background recommended',                                  NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including Chemistry or Biology',  26, NULL::NUMERIC, 100, 55),
  ('Civil Engineering',                   '30%', 'Personal statement; certified academic transcripts; proof of English proficiency; Mathematics and Physics background required',                                   NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 3.0::NUMERIC, 'BCC including Mathematics and Physics', 26, NULL::NUMERIC, 100, 55),
  ('Economics',                           '40%', 'Personal statement; certified academic transcripts; proof of English proficiency; Mathematics background recommended',                                           NULL::INTEGER, 6.0::NUMERIC, 80, NULL::INTEGER, NULL::INTEGER, 2.7::NUMERIC, 'BCC including Mathematics',           26, NULL::NUMERIC, 100, 55)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universiti Putra Malaysia (UPM)';
