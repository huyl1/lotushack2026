-- Part 1: Update university-level data for Hong Kong Baptist University
-- Non-local tuition 2025/26: HK$175,000/yr; HKD to USD at ~7.78 => ~$22,500 USD
-- Source: https://admissions.hkbu.edu.hk/fees-and-scholarships.html
UPDATE public.universities SET
  website_url = 'https://admissions.hkbu.edu.hk/en/international.html',
  tuition_usd = 22500,
  overall_acceptance_rate = '~36%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Early Round: Oct 2 – Nov 16; Main Round: Nov 17 – Feb 1; Extended Round: Feb 2 – May 31',
  financial_aid = 'Merit-based. Full Scholarship (100% tuition HKD190,000 + living subsidies HKD52,500). Tuition-waiver Scholarship (100% tuition HKD190,000). Half Scholarship (50% of full scholarship). Admission scholarships up to USD124K available for outstanding non-local students. No separate application required; automatically considered.'
WHERE name = 'Hong Kong Baptist University';

-- Part 2: Insert top 10 majors for Hong Kong Baptist University
-- Admission requirements: IELTS 6.0, TOEFL 79, SAT 1190, ACT 23, A-Level Grade E in 3 subjects, IB Diploma 28 typical
-- Source: https://admissions.hkbu.edu.hk/content/dam/ao-assets/document/download-area/international-qualifications-2026.pdf
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
  ('Business Administration (Finance)', '~40%', 'School of Business broad-based BBA application; declare Finance concentration after Year 1. AACSB-accredited. Strong quantitative background preferred.', NULL::INTEGER, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL::NUMERIC, NULL::INTEGER, 58),
  ('Business Administration (Economics and Data Analytics)', '~38%', 'School of Business broad-based BBA application; declare Economics and Data Analytics concentration after Year 1. Strong mathematics background required. AACSB-accredited.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Communication', '~35%', 'School of Communication broad-based application; declare concentration (Journalism, Public Relations, Film, etc.) after Year 1. Portfolio or writing sample may strengthen application.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Computer Science', '~35%', 'Faculty of Science application; strong mathematics background required. Covers AI, cybersecurity, data science, and software engineering streams.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Chinese Medicine (BChMed and BSc)', '~25%', '6-year double degree programme combining Chinese Medicine and Biomedical Science. Chinese language proficiency required. Highly competitive; limited places.', NULL, 6.0, 79, 1190, 23, 3.2, 'ABB', 30, NULL, NULL, 58),
  ('Applied Biology', '~40%', 'Faculty of Science application; strong biology and chemistry background required. Covers biotechnology, environmental biology, and health science streams.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Social Work', '~35%', 'Bachelor of Social Work (Hons) application; personal statement recommended. Strong communication and community engagement skills expected. Accredited by HKSWA.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Arts and Technology (Transdisciplinary)', '~38%', 'Transdisciplinary programme combining arts, design, and technology. Portfolio of creative work strongly encouraged. Graduates equipped for creative and tech industries.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('English Language and Literature', '~40%', 'Faculty of Arts and Social Sciences broad-based BA application; declare English Language and Literature after Year 1. Strong English writing ability expected.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58),
  ('Mathematics', '~40%', 'Faculty of Science application; strong mathematics background essential. Covers pure mathematics, applied mathematics, and statistics. Good foundation for finance, data science, and research careers.', NULL, 6.0, 79, 1190, 23, 3.0, 'EEE', 28, NULL, NULL, 58)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Hong Kong Baptist University';
