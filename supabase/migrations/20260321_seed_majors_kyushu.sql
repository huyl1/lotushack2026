-- Part 1: Update university-level data for Kyushu University
UPDATE public.universities SET
  website_url = 'https://www.kyushu-u.ac.jp/en/prospective-students/undergraduate.html',
  tuition_usd = 3590,
  overall_acceptance_rate = '~14% overall; highly selective programs 0-9%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Q-LEAP (English Engineering program): application typically Oct-Dec for April intake. International undergraduate (EJU-based): Nov-Jan. Japanese-taught programs: EJU November + January general exam.',
  financial_aid = 'MEXT (Japanese Government) Scholarship: full tuition waiver + monthly stipend (~JPY 117,000). JASSO scholarships available. Kyushu University President''s Fellowship and institutional grants for outstanding students. Standard national university tuition JPY 535,800/yr (~$3,590) — same for domestic and international students.'
WHERE name = 'Kyushu University';

-- Part 2: Insert top 10 majors for Kyushu University
-- subject_ranking is INTEGER (QS numeric rank); NULL where no discrete rank is published
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
  ('Engineering (English Program Q-LEAP)', NULL::text, 'Q-LEAP (Quantum Leap with Advanced Program): document screening, academic records, personal statement, and interview. Conducted entirely in English. No Japanese required at entry. QS Engineering & Technology #101-150 World.', 125::integer, 6.5::numeric, 79::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 28::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Agriculture', NULL::text, 'International undergraduate admission via EJU (Examination for Japanese University Admission) for Japanese-taught track. English-medium option available through special international selection. Document screening + interview. QS Agriculture & Forestry #51-100 World.', 75::integer, 6.0::numeric, 72::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 26::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Medicine', NULL::text, 'Six-year program. International selection requires document screening, academic records, and interview. Japanese proficiency strongly recommended for clinical years. Extremely competitive. QS Medicine #101-150 World.', 125::integer, 6.5::numeric, 79::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 30::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Science', NULL::text, 'International undergraduate admission via special selection or EJU. Document screening and interview required. Strong background in mathematics and sciences expected. QS Natural Sciences #151-200 World.', NULL::integer, 6.5::numeric, 79::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 28::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Dental Science', NULL::text, 'Six-year program. International selection via document screening and interview. Japanese proficiency required for clinical practicum. Extremely competitive intake. One of Japan''s leading dental schools.', NULL::integer, 6.5::numeric, 79::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 28::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Pharmaceutical Sciences', NULL::text, 'Four-year (Pharmaceutical Sciences) or six-year (Pharmacy) program. International selection via document screening and interview. Chemistry and biology background required. QS Pharmacy & Pharmacology #51-100 World.', 75::integer, 6.5::numeric, 79::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 28::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Design (Arts and Technology)', NULL::text, 'Special international selection via portfolio review, document screening, and interview. Faculty of Design is one of Japan''s leading design schools integrating art, engineering, and architecture.', NULL::integer, 6.0::numeric, 72::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 28::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Economics and Business Administration', NULL::text, 'International undergraduate selection via document screening, academic records, and interview. English-taught courses available within the faculty. Background in mathematics recommended. QS Business & Management Studies Top 200 World.', NULL::integer, 6.0::numeric, 72::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 26::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Law', NULL::text, 'International undergraduate selection via document screening and interview. Program covers civil law, public law, and international relations. Some English-medium courses available.', NULL::integer, 6.0::numeric, 72::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 26::integer, NULL::numeric, NULL::integer, NULL::integer),
  ('Letters (Humanities)', NULL::text, 'International undergraduate selection via document screening and interview. Covers literature, history, philosophy, and linguistics. Japanese language proficiency beneficial for upper-year courses.', NULL::integer, 6.0::numeric, 72::integer, NULL::integer, NULL::integer, 3.0::numeric, NULL::text, 26::integer, NULL::numeric, NULL::integer, NULL::integer)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Kyushu University';
