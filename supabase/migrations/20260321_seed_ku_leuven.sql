-- Part 1: University-level data for KU Leuven
UPDATE public.universities SET
  website_url = 'https://www.kuleuven.be/english/',
  tuition_usd = 10253,
  overall_acceptance_rate = '34%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Rolling admissions; Non-EEA bachelor applicants: March 1 general deadline; English-taught programmes may have programme-specific deadlines (check application window tool). EEA applicants: no fixed deadline for Dutch programmes. Academic year starts mid-September. Application fee: EUR 90 (non-refundable).',
  financial_aid = 'Low tuition by design (~EUR 1,181 for EEA; ~EUR 9,494 for non-EEA, 2026-2027). Partial Tuition Fee Waivers for non-EEA students from low-income countries (reduced to EEA rate). Science@Leuven Scholarships (EUR 12,000/year allowance + partial tuition waiver for Master''s in Science). Faculty-specific scholarships (e.g., Institute of Philosophy waiver). Erasmus Mundus scholarships for eligible joint programmes. KU Leuven Doctoral Scholarships. Blocked account of ~EUR 12,012/year required for non-EEA student visa.'
WHERE name = 'KU Leuven';

-- Part 2: Top 10 majors for KU Leuven
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Business Engineering', NULL, 'Joint degree with UCLouvain Saint-Louis Brussels; motivation letter required; mathematics proficiency required (A-Level Maths grade A minimum + Physics/Chemistry grade B minimum); CV; gap year explanation if applicable', 'QS #60 World (Business); EQUIS accredited', 6.5, 90, NULL, NULL, NULL, 'AAB (Maths A required)', 34, NULL, NULL, NULL),
  ('Business Administration', NULL, 'Motivation letter required; CV; English proficiency required; taught at Brussels campus; gap year explanation if applicable', 'QS #60 World (Business); EQUIS accredited', 6.5, 90, NULL, NULL, NULL, 'ABB', 32, NULL, NULL, NULL),
  ('Law', NULL, 'Trilingual programme (Dutch/French/English) at Brussels campus; proof of language proficiency in all three languages; motivation letter; strong growth in enrollment (+18.6%)', 'QS #38 World; THE #14 World', 6.5, 79, NULL, NULL, NULL, 'AAA', 34, NULL, NULL, NULL),
  ('Medicine (Geneeskunde)', 5.0, 'Taught in Dutch; mandatory entrance exam (toelatingsexamen) with very limited places; strong science background in biology, chemistry, physics, and mathematics required; 6-year programme leading to MD equivalent', 'QS #29 World; THE #43 World (Clinical & Health)', NULL, NULL, NULL, NULL, NULL, 'A*A*A (Sciences)', 40, 99.5, NULL, NULL),
  ('Engineering Science', NULL, 'Taught in Dutch at bachelor level; English-taught Master''s available; strong mathematics and physics background required; entrance exam for civil engineering track (ijkingstoets); highly selective', 'QS #57 World (Engineering & Technology); THE #50 World', 7.0, 94, NULL, NULL, NULL, 'A*AA (Maths + Physics required)', 38, 98.0, NULL, NULL),
  ('Philosophy', NULL, 'One of 7 English-taught bachelor''s; motivation letter; partial tuition fee waiver available for non-EEA students from low-income countries; strong humanities background', 'QS #6 World (2023); THE #22 World (Arts & Humanities)', 6.5, 79, NULL, NULL, NULL, 'ABB', 32, NULL, NULL, NULL),
  ('Bioscience Engineering', NULL, 'Taught in Dutch at bachelor level; English-taught Master''s available; strong science and mathematics background required; covers biotechnology, food technology, environmental science, and land & water management', 'QS Top 50 World (Agriculture & Forestry)', NULL, NULL, NULL, NULL, NULL, 'A*AA (Sciences required)', 36, 97.0, NULL, NULL),
  ('Economics', NULL, 'Taught in Dutch at bachelor level; English-taught Master''s available; strong quantitative skills required; mathematics background essential', 'QS Top 50 World; THE #57 World (Business & Economics)', 6.5, 79, NULL, NULL, NULL, 'AAB', 34, NULL, NULL, NULL),
  ('Computer Science (Informatica)', NULL, 'Taught in Dutch at bachelor level; English-taught Master''s available (MSc Computer Science seeing rapid internationalization with significant enrollment growth); strong mathematics and programming background required', 'THE #41 World (Computer Science); QS Top 100 World', NULL, NULL, NULL, NULL, NULL, 'A*AA (Maths required)', 36, 97.0, NULL, NULL),
  ('European Studies', NULL, 'English-taught bachelor''s programme; interdisciplinary focus on European politics, law, economics, and culture; motivation letter and CV required; joint programme requiring formal application even for Flemish degree holders', 'KU Leuven is a founding member of Una Europa alliance', 6.5, 79, NULL, NULL, NULL, 'ABB', 32, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'KU Leuven';
