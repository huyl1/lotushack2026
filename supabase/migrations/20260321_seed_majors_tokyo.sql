-- Part 1: Update university-level data for The University of Tokyo
UPDATE public.universities SET
  website_url = 'https://www.u-tokyo.ac.jp/en/prospective-students.html',
  tuition_usd = 4430,
  overall_acceptance_rate = '~34%',
  test_policy = 'Not applicable',
  deadline_calendar = 'PEAK (English UG): Application Nov 11 – Dec 9; Acceptance Mar 30; Enrollment Sep 1. Regular UG (Japanese-taught): Jan–Feb. Graduate programs: varies by department (typically Oct–Jan for spring intake).',
  financial_aid = 'Need-aware. UTokyo Scholarship: full tuition waiver + JPY 126,000/mo (~$870/mo) for up to 10 PEAK students. MEXT (Japanese Government) Scholarship: full tuition + round-trip airfare + JPY 120,000/mo. JASSO scholarships also available. Tuition exemption available for qualifying domestic and international students.'
WHERE name = 'The University of Tokyo';

-- Part 2: Delete existing majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'The University of Tokyo');

-- Part 3: Insert top 10 majors for The University of Tokyo
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
  ('Engineering', '~23%', 'Regular admission requires Japanese proficiency (EJU). Covers Civil, Mechanical, Electrical, Applied Chemistry, Aerospace, Precision, Systems Innovation and more (16 departments). Highly competitive Natural Sciences II stream.', 'QS #13 World (Engineering & Technology)', 7.0, 100, NULL, NULL, 3.7, 'A*AA', 38, NULL, NULL, NULL),
  ('Law', '~33%', 'Regular admission requires Japanese proficiency (EJU). Highly regarded program covering constitutional law, civil law, criminal law, and international law. Six-year joint UG-JD track available at graduate level.', 'QS Top 100 World (Law & Legal Studies)', 7.0, 100, NULL, NULL, 3.5, 'AAA', 36, NULL, NULL, NULL),
  ('Economics', '~33%', 'Regular admission requires Japanese proficiency (EJU). Strong quantitative focus; mathematics background essential. Covers microeconomics, macroeconomics, econometrics, and economic history.', 'QS Top 100 World (Economics & Econometrics)', 7.0, 100, NULL, NULL, 3.5, 'AAA', 36, NULL, NULL, NULL),
  ('Science (Physics, Chemistry, Mathematics, Biology)', '~39%', 'Regular admission requires Japanese proficiency (EJU). Natural Sciences I stream (broadest sciences). Covers physics, chemistry, mathematics, biology, earth sciences, and astronomy.', 'QS #30 World (Natural Sciences)', 7.0, 100, NULL, NULL, 3.7, 'A*AA', 38, NULL, NULL, NULL),
  ('Medicine', '~10%', 'Regular admission requires Japanese proficiency (EJU). Six-year program. Extremely competitive; requires exceptional academic record. Separate national medical licensing examination after graduation.', 'QS Top 50 World (Medicine)', 7.0, 100, NULL, NULL, 3.9, 'A*A*A*', 40, NULL, NULL, NULL),
  ('Agriculture', '~35%', 'Regular admission requires Japanese proficiency (EJU). Covers bioresource sciences, applied life sciences, forest sciences, aquatic biosciences, agricultural and resource economics, and veterinary medicine.', 'QS Top 100 World (Agriculture & Forestry)', 7.0, 100, NULL, NULL, 3.4, 'AAB', 34, NULL, NULL, NULL),
  ('Letters (Humanities)', '~33%', 'Regular admission requires Japanese proficiency (EJU). Humanities and Social Sciences I stream. Covers philosophy, history, literature, linguistics, cultural studies, and area studies.', NULL, 7.0, 100, NULL, NULL, 3.4, 'AAB', 34, NULL, NULL, NULL),
  ('Education', '~33%', 'Regular admission requires Japanese proficiency (EJU). Interdisciplinary program covering education science, school education, and educational psychology. Humanities and Social Sciences stream.', NULL, 7.0, 100, NULL, NULL, 3.4, 'AAB', 34, NULL, NULL, NULL),
  ('Japan in East Asia (PEAK – English)', '~10%', 'English-taught 4-year bachelor''s via PEAK program. No Japanese required at entry. Application Nov–Dec; online interview Feb–Mar. Accepts SAT (1480+), ACT, or IB (38+/42). TOEFL/IELTS required (non-native English speakers). ~15–20 seats per year.', NULL, 7.0, 100, 1480, 33, 3.7, 'A*AA', 38, NULL, NULL, NULL),
  ('Environmental Sciences (PEAK – English)', '~10%', 'English-taught 4-year bachelor''s via PEAK program. No Japanese required at entry. Application Nov–Dec; online interview (includes math test) Feb–Mar. Accepts SAT (1480+ with 750+ Math), ACT, or IB (38+/42). TOEFL/IELTS required (non-native English speakers). ~15–20 seats per year.', NULL, 7.0, 100, 1480, 33, 3.7, 'A*AA', 38, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'The University of Tokyo';
