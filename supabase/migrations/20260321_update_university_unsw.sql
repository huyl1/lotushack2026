-- Part 1: Update UNSW university record
UPDATE public.universities
SET
  website_url = 'https://www.unsw.edu.au/study/international-students',
  tuition_usd = 33100,
  overall_acceptance_rate = '35%',
  test_policy = 'Not applicable',
  deadline_calendar = 'T1 (Feb): Oct 31 (international); T2 (May): Mar 31 (international); T3 (Sep): Jul 31 (international)',
  financial_aid = 'Need-aware. International Student Award: 20% tuition reduction for duration of program. Australia''s Global University Award: up to AUD $20,000/yr toward fees. Full tuition scholarships available for top applicants. Scholarships awarded automatically at admission based on academic merit.'
WHERE name = 'The University of New South Wales';

-- Part 2: Replace majors
DELETE FROM public.majors
WHERE university_id = (SELECT id FROM public.universities WHERE name = 'The University of New South Wales');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Commerce', '30%', 'Standard application via UAC; no supplemental required; specialisations include Accounting, Finance, Marketing', 'QS #22 Accounting & Finance, #35 Business & Management globally (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 33, 88.0, 110, 65),
  ('Computer Science', '25%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Advanced; strong demand program', 'QS #46 Computer Science & Information Systems (2025)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 36, 92.0, 110, 64),
  ('Civil Engineering', '35%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Extension 1 and Physics', 'QS #24 Civil & Structural Engineering (2025)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 36, 92.0, 110, 64),
  ('Law (Juris Doctor / Double Degree)', '10%', 'Law only offered as double degree at undergraduate level via UAC; Law Admission Test (LAT) recommended; high competition', 'QS #12 Law & Legal Studies globally (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA', 42, 97.7, 120, 65),
  ('Medicine (Doctor of Medicine)', '5%', 'UCAT ANZ required; MMI interview; domestic ATAR pathway; most competitive program nationally with ~1,600 first preferences annually', 'THE #64 Clinical & Health globally (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'A*A*A', 42, 97.0, 125, 65),
  ('Electrical Engineering', '35%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Extension 1 and Physics; includes Hardware and Software streams', 'QS #32 Electrical & Electronic Engineering (2025)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 36, 92.0, 110, 64),
  ('Actuarial Studies', '15%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Extension 1; one of Australia''s top actuarial programs', 'QS #22 Accounting & Finance (shared) (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA', 38, 96.0, 110, 65),
  ('Mechanical Engineering', '35%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Extension 1 and Physics; includes Mechatronics stream', 'QS #46 Mechanical, Aeronautical & Manufacturing Engineering (2025)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 36, 92.0, 110, 64),
  ('Architecture', '20%', 'Standard application via UAC; no portfolio required for undergraduate entry; portfolio required for Honours year; ATAR 88 minimum', 'QS #23 Architecture / Built Environment (2025)', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 33, 88.0, 110, 64),
  ('Economics', '40%', 'Standard application via UAC; assumed knowledge of HSC Mathematics Advanced; offered within UNSW Business School', 'QS #40 Economics & Econometrics (2025)', 7.0, 94, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAB', 32, 86.0, 110, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'The University of New South Wales';
