-- Part 1: Update university-level data for The University of Osaka
UPDATE public.universities SET
  website_url = 'https://www.osaka-u.ac.jp/en',
  tuition_usd = 3572,
  overall_acceptance_rate = '~41%',
  test_policy = 'Not applicable',
  deadline_calendar = 'IUPS (Science programs): Oct–Nov for Sep enrollment; HUS IUDP (Human Sciences): Oct–Nov for Sep enrollment; application guidelines published ~Aug–Sep each year',
  financial_aid = 'Need-aware. MEXT Japanese Government Scholarship: full tuition waiver + ~JPY 117,000/mo (~$780/mo) stipend. JASSO Honors Scholarship available. Partial tuition waivers for international students through university programs. Osaka University International Student Support Fund.'
WHERE name = 'The University of Osaka';

-- Part 2: Insert top 10 majors for The University of Osaka
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
  ('Human Sciences (International Undergraduate Degree Program)', '~15%', 'HUS IUDP: document screening + interview. Personal statement, 2 recommendation letters, academic transcripts, and English proficiency certification required. All classes taught in English. Japanese language study included in curriculum.', 151, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.3, 'ABB', 28, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Mathematics (International Undergraduate Program in Science)', '~10%', 'IUPS: document screening + written examination in English (and Japanese for Mathematics). Six-month preliminary Japanese language education prior to enrollment. Strong mathematics background required. 2 recommendation letters and personal statement needed.', 151, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Physics (International Undergraduate Program in Science)', '~10%', 'IUPS: document screening + written examination in English. Six-month preliminary Japanese language education prior to enrollment. Strong physics and mathematics background required. 2 recommendation letters and personal statement needed.', 101, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Chemistry (International Undergraduate Program in Science)', '~10%', 'IUPS: document screening + written examination in English. Six-month preliminary Japanese language education prior to enrollment. Strong chemistry and mathematics background required. 2 recommendation letters and personal statement needed.', 101, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Biological Sciences (International Undergraduate Program in Science)', '~10%', 'IUPS: document screening + written examination in English. Six-month preliminary Japanese language education prior to enrollment. Strong biology and chemistry background required. 2 recommendation letters and personal statement needed.', 101, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Chemistry-Biology Combined Major (International Undergraduate Program in Science)', '~10%', 'IUPS Chemistry-Biology Combined track: document screening + written examination in English covering both chemistry and biology. Six-month preliminary Japanese language education prior to enrollment. 2 recommendation letters and personal statement required.', 101, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Engineering Science (International Undergraduate Program)', '~12%', 'IUPS Engineering Science: document screening + written examination in English. Physics and mathematics focus in first two years; specialization from year 3. Six-month preliminary Japanese language education prior to enrollment. 2 recommendation letters required.', 75, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Economics (International Program)', '~20%', 'International Economics Program: document screening + interview conducted in English. Personal statement and 2 recommendation letters required. Japanese language study encouraged but classes primarily in English. Separate quota for international applicants.', 151, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.3, 'AAB', 28, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Information Science and Technology (International Undergraduate Program)', '~12%', 'IUPS-aligned Information Science track: document screening + written examination in English covering mathematics and logic. Six-month preliminary Japanese language program prior to enrollment. Programming aptitude and mathematics background required.', 101, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.5, 'AAA', 30, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER),
  ('Pharmaceutical Sciences (International Undergraduate Program)', '~8%', 'Document screening + written examination in English covering chemistry and biology. Six-month preliminary Japanese language education required prior to enrollment. Strong chemistry background essential. 2 recommendation letters and personal statement required.', 51, 6.5, 85, NULL::INTEGER, NULL::INTEGER, 3.7, 'AAA', 32, NULL::NUMERIC, NULL::INTEGER, NULL::INTEGER)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'The University of Osaka';
