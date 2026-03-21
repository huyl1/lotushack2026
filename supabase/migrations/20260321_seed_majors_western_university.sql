-- Part 1: Update Western University university-level data
-- International tuition ~CAD 50,000/yr average converted to USD at 0.73 rate = ~USD 36,500
UPDATE public.universities
SET
  website_url             = 'https://www.uwo.ca',
  overall_acceptance_rate = 0.58,
  tuition_usd             = 36500,
  test_policy             = 'Not applicable'
WHERE name = 'Western University';

-- Part 2: Insert 10 undergraduate majors for Western University
-- Canadian university: sat_min=null, act_min=null, atar_min=null
-- IELTS 6.5, TOEFL 88, Duolingo 115, PTE 65
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
  ('Ivey Business Administration (HBA)',  '18%', 'Ivey Advanced Entry Opportunity (AEO) supplemental application required. Requires 90%+ high school average including Grade 12 English and a mathematics course. Leadership and extracurricular experience assessed equally with academics (50/50). 80%+ two-year university average required to progress to HBA years 3 and 4.', 51,  6.5, 88, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA including Mathematics',             33, NULL::NUMERIC, 115, 65),
  ('Medical Sciences',                    '20%', 'Highly competitive direct-entry program. Requires Grade 12 Biology, Chemistry, and Mathematics. Typical admission average 93%+. No separate supplemental application but pool is very competitive.',                                                                                                                             101, 6.5, 88, NULL,           NULL,           3.8, 'AAA including Biology and Chemistry',  35, NULL,          115, 65),
  ('Engineering',                         '38%', 'Requires Grade 12 Mathematics (Advanced Functions and Calculus & Vectors), Grade 12 Physics and Chemistry. Typical admission average 85-92%. No supplemental application.',                                                                                                                                                  251, 6.5, 88, NULL,           NULL,           3.5, 'AAB including Mathematics and Physics', 30, NULL,          115, 65),
  ('Computer Science',                    '42%', 'Requires Grade 12 Mathematics (Advanced Functions). Calculus & Vectors recommended. Typical admission average 85%+. No supplemental application.',                                                                                                                                                                           351, 6.5, 88, NULL,           NULL,           3.4, 'ABB including Mathematics',             30, NULL,          115, 65),
  ('Nursing',                             '30%', 'Requires Grade 12 Biology and Chemistry. Typical admission average 88%+. Competitive entry; supplemental information may be requested. Clinical placement required during program.',                                                                                                                                           101, 6.5, 88, NULL,           NULL,           3.6, 'AAB including Biology and Chemistry',  32, NULL,          115, 65),
  ('Psychology',                          '62%', 'No supplemental application. Admitted through Faculty of Social Science. Requires Grade 12 English. Strong breadth of courses recommended.',                                                                                                                                                                                 201, 6.5, 88, NULL,           NULL,           3.2, 'ABB',                                  28, NULL,          115, 65),
  ('Economics',                           '65%', 'No supplemental application. Admitted through Faculty of Social Science. Grade 12 Mathematics recommended. Calculus & Vectors beneficial.',                                                                                                                                                                                  301, 6.5, 88, NULL,           NULL,           3.2, 'ABB including Mathematics',             28, NULL,          115, 65),
  ('Political Science',                   '65%', 'No supplemental application. Admitted through Faculty of Social Science. Requires Grade 12 English. Broad social science background recommended.',                                                                                                                                                                            201, 6.5, 88, NULL,           NULL,           3.2, 'ABB',                                  28, NULL,          115, 65),
  ('Biology',                             '60%', 'No supplemental application. Admitted through Faculty of Science. Requires Grade 12 Biology and Chemistry. Calculus & Vectors beneficial for Honours specializations.',                                                                                                                                                       201, 6.5, 88, NULL,           NULL,           3.3, 'ABB including Biology and Chemistry',  28, NULL,          115, 65),
  ('Kinesiology',                         '45%', 'Requires Grade 12 Biology. Chemistry recommended. Typical admission average 83-88%. No supplemental application. Combines exercise science, anatomy, and physiology.',                                                                                                                                                       101, 6.5, 88, NULL,           NULL,           3.4, 'ABB including Biology',                 29, NULL,          115, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking,
       ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades,
       ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Western University';
