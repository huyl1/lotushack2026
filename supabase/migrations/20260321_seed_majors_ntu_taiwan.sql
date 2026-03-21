-- Part 1: Update university-level data for National Taiwan University (NTU)
UPDATE public.universities SET
  website_url = 'https://admissions.ntu.edu.tw/apply/degree-students/',
  tuition_usd = 3700,
  overall_acceptance_rate = '~43%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Round 1: Nov 13; Round 2: Jan 15 (September entry)',
  financial_aid = 'Need-aware for intl. Taiwan Scholarship: full tuition waiver + TWD 30,000/mo stipend. NTU Outstanding Intl Student Scholarship: tuition subsidy up to TWD 65,000/semester. NTU Centennial Fellowship for graduate students.'
WHERE name = 'National Taiwan University (NTU)';

-- Part 2: Insert top 10 majors for National Taiwan University (NTU)
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
  ('Electrical Engineering', '~30%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; Chinese or English proficiency proof', 48, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Computer Science and Information Engineering', '~25%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; strong math background recommended', 91, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Medicine', '~5%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; interview required; 7-year program', 46, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Business Administration', '~35%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters', 51, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Economics', '~40%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters', 91, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Civil Engineering', '~45%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; strong math and physics background recommended', 38, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Law', '~30%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; Chinese proficiency strongly recommended (most courses in Chinese)', 72, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Chemical Engineering', '~40%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; strong chemistry and math background recommended', 69, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Mechanical Engineering', '~40%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; strong math and physics background recommended', 76, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Global Undergraduate Program in Semiconductors', '~20%', 'Online application via OIA system; high school diploma; transcript; statement of purpose; two recommendation letters; fully English-taught program; strong math and physics background required', NULL, 5.5, 71, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'National Taiwan University (NTU)';
