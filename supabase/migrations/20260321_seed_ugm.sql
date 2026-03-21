-- Part 1: Update Universitas Gadjah Mada university details
-- Source: https://admissions.ugm.ac.id/v26/international-applicants-foreign/information/tuition-fee/
-- Tuition: IUP-WNA programs range IDR 25,000,000–67,000,000/semester (~$1,667–$4,467/sem at ~15,000 IDR/USD)
-- Annual tuition range ~$3,333–$8,933; representative mid-range used for tuition_usd
-- Exchange rate used: 1 USD ≈ 15,000 IDR (2025 rate)

UPDATE public.universities
SET
  website_url = 'https://ugm.ac.id/en/',
  tuition_usd = 6600,
  test_policy = 'Not applicable',
  overall_acceptance_rate = 8.0,
  setting = 'Urban',
  size_category = 'Large',
  financial_aid = true
WHERE name = 'Universitas Gadjah Mada';

-- Part 2: Insert 10 majors for Universitas Gadjah Mada (IUP-WNA international programs)
-- Source: https://admissions.ugm.ac.id/v26/international-applicants-foreign/information/tuition-fee/
-- IELTS min 6.0, TOEFL iBT min 61, Duolingo min 90 per UGM IUP requirements
-- No SAT/ACT/ATAR required (Indonesian university)
-- subject_ranking stored as NULL (integer column); ranking context in supplemental_requirements

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Economics', '8.0', 'IUP-WNA program; Faculty of Economics and Business; English proficiency required; motivation letter; CV; high school transcripts; equivalent to A-Level/IB required for overseas students; QS #251-300 Economics & Econometrics (2025); #2 nationally', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Management', '8.0', 'IUP-WNA program; Faculty of Economics and Business; English proficiency required; motivation letter; CV; high school transcripts; written test or interview may be required; QS #251-300 Business & Management Studies (2025); top-ranked in Indonesia', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Accounting', '8.0', 'IUP-WNA program; Faculty of Economics and Business; English proficiency required; motivation letter; CV; high school transcripts; top-ranked Accounting program in Indonesia', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Law', '10.0', 'IUP-WNA program; Faculty of Law; English proficiency required; motivation letter; CV; high school transcripts; interview may be required; QS #201-250 Law (2025); #1 Law faculty in Indonesia', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('International Relations', '10.0', 'IUP-WNA program; Faculty of Social and Political Sciences; English proficiency required; motivation letter; CV; high school transcripts; strong focus on Southeast Asian studies', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Medicine', '5.0', 'IUP-WNA program; Faculty of Medicine, Public Health and Nursing; English proficiency required; motivation letter; CV; high school transcripts with strong science background; interview required; QS #451-500 Medicine (2025); #1 Medical faculty in Indonesia', NULL::integer, 6.5::numeric, 79, NULL::integer, NULL::integer, NULL::numeric, 'AAB', 34, NULL::numeric, 100, 58),
  ('Chemical Engineering', '7.0', 'IUP-WNA program; Faculty of Engineering; English proficiency required; motivation letter; CV; high school transcripts; IChemE and IABEE accredited; community service requirement; QS #239 Engineering (2025); #2 nationally', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Public Policy and Management', '10.0', 'IUP-WNA program; Faculty of Social and Political Sciences; English proficiency required; motivation letter; CV; high school transcripts; leading public policy program in Indonesia; strong regional and international focus', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Communication Science', '10.0', 'IUP-WNA program; Faculty of Social and Political Sciences; English proficiency required; motivation letter; CV; high school transcripts; top-ranked Communication program in Indonesia; media and digital communication focus', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50),
  ('Biology', '8.0', 'IUP-WNA program; Faculty of Biology; English proficiency required; motivation letter; CV; high school transcripts with strong science background; QS #301-350 Biological Sciences (2025); research-intensive; field and laboratory work required', NULL::integer, 6.0::numeric, 61, NULL::integer, NULL::integer, NULL::numeric, 'BBB', 30, NULL::numeric, 90, 50)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universitas Gadjah Mada';
