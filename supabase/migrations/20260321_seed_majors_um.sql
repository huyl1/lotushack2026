-- Part 1: Update university-level data for Universiti Malaya (UM)
UPDATE public.universities SET
  website_url = 'https://study.um.edu.my/apply-now',
  tuition_usd = 5000,
  overall_acceptance_rate = '~34%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Semester I (Oct intake): Feb - May; Semester II (Mar intake): Sep 8 - Jan 30; Rolling for postgraduate',
  financial_aid = 'Need-aware. Limited UG scholarships for international students. ASEAN-Maybank Scholarship (full tuition + living allowance). Merit-based partial tuition waivers available. MEXT and government-linked scholarships for select nationalities. Bright Scholarship for PhD (full tuition + RM3,500/mo stipend).'
WHERE name = 'Universiti Malaya (UM)';

-- Part 2: Insert top 10 majors for Universiti Malaya (UM)
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
  ('Computer Science', NULL, 'A-Level grades of 80%+ with priority in Mathematics and Physics; 75% (B) in two of Computing/Chemistry/Biology. 3.5-year program.', 'QS #64 World (Computer Science & Information Systems)', 6.0, 80, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 57),
  ('Medicine (MBBS)', NULL, 'Highly competitive; A-Level grades of 90%+ in Biology and Chemistry required; interview required. 5-year program. Separate fee structure (~RM 500,000 total via SATU channel).', 'QS #123 World (Medicine)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 38, 90.0, NULL, 65),
  ('Mechanical Engineering', NULL, 'A-Level grades of 80%+ with priority in Mathematics and Physics; 75% (B) in two relevant subjects. 4-year program.', 'QS #120 World (Mechanical Engineering)', 5.0, 60, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 41),
  ('Electrical and Electronic Engineering', NULL, 'A-Level grades of 80%+ with priority in Mathematics and Physics; 75% (B) in two relevant subjects. 4-year program.', 'QS #67 World (Electrical & Electronic Engineering)', 5.0, 60, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 41),
  ('Business Administration', NULL, 'Standard university application; no supplemental requirements beyond general entry. 3-year program.', 'QS #106 World (Business & Management Studies)', 5.0, 60, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 41),
  ('Accounting', NULL, 'Standard university application; strong quantitative background recommended. 3.5-year program.', 'QS #63 World (Accounting & Finance)', 5.0, 60, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 41),
  ('Law', NULL, 'A-Level grades of 80%+ required; strong English proficiency essential. 4-year program.', 'QS #51-100 World (Law & Legal Studies)', 6.0, 80, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 57),
  ('Education (TESL)', NULL, 'A-Level with relevant subjects; strong English proficiency required. Teaching English as a Second Language specialization. 4-year program.', 'QS #38 World (Education & Training)', 6.0, 80, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 57),
  ('Chemical Engineering', NULL, 'A-Level grades of 80%+ with priority in Mathematics and Chemistry; 75% (B) in two relevant subjects. 4-year program.', 'QS #80 World (Chemical Engineering)', 5.0, 60, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 41),
  ('Pharmacy', NULL, 'A-Level grades of 80%+ in Chemistry and Biology or Mathematics required. 4-year program. Supplemental interview may be required.', 'QS #80 World (Pharmacy & Pharmacology)', 6.0, 80, NULL, NULL, 3.0, 'BB', 35, 80.0, NULL, 57)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universiti Malaya (UM)';
