-- Australian National University: university update + majors seed
-- Sources: anu.edu.au, shiksha.com, stubard.com, universityliving.com, scholarshipsfuture.com
-- AUD→USD conversion rate: 0.64 (March 2026 approximate)
-- Tuition: AUD 43,000–53,000/year international UG; midpoint AUD 48,000 ≈ USD 30,720 → USD 31,000
-- Acceptance rate: ~35% overall
-- Deadline: Semester 1 (Feb) apply by 15 Dec; Semester 2 (Jul) apply by 31 May → rolling two-intake

-- Part 1: Update university record
UPDATE public.universities
SET
  website_url             = 'https://www.anu.edu.au',
  tuition_usd             = 31000,
  overall_acceptance_rate = '35%',
  test_policy             = 'Not applicable',
  deadline_calendar       = 'rolling',
  financial_aid           = 'Yes – Chancellor''s International Scholarship awards 25% or 50% tuition reductions (up to AUD 25,000/year) for high-achieving international undergraduates; automatically assessed on admission, no separate application required'
WHERE name = 'Australian National University';

-- Part 2: Replace majors
DELETE FROM public.majors
WHERE university_id = (SELECT id FROM public.universities WHERE name = 'Australian National University');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('International Relations & Political Science', 30.0, 'Standard university application; apply via UAC or direct to ANU; strong emphasis on global affairs and policy research', 'QS #7 Politics & International Studies', 6.5, 92, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 32, 88.0, 115, 64),
  ('Law (Juris Doctor / LLB)', 10.0, 'Standard university application; LLB offered as double degree only; high demand, very competitive ATAR cutoff', 'QS #27 Law & Legal Studies', 7.0, 100, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA', 40, 98.0, 120, 65),
  ('Computer Science', 25.0, 'Standard university application; assumed knowledge of Mathematics; programming experience advantageous', 'QS #101–150 Computer Science & Information Systems', 6.5, 92, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 33, 88.0, 110, 64),
  ('Engineering (Software / Systems)', 30.0, 'Standard university application; assumed knowledge of Mathematics and Physics', 'QS #101–150 Engineering & Technology', 6.5, 92, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 33, 88.0, 110, 64),
  ('Economics', 35.0, 'Standard university application; assumed knowledge of Mathematics; offered through ANU College of Business and Economics', 'QS #51–100 Economics & Econometrics', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 32, 85.0, 110, 64),
  ('Philosophy', 45.0, 'Standard university application; no additional requirements; ANU philosophy department ranked among world''s best', 'QS #13 Philosophy', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBC', 30, 80.0, 105, 58),
  ('Science (Physics / Astronomy)', 40.0, 'Standard university application; assumed knowledge of Mathematics and Physics; access to Mt Stromlo Observatory', 'QS #51–100 Physics & Astronomy', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 31, 83.0, 110, 64),
  ('Biotechnology (Honours)', 30.0, 'Standard university application; assumed knowledge of Biology and Chemistry; Honours pathway embedded in degree', 'QS #51–100 Biological Sciences', 6.5, 90, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'ABB', 32, 85.0, 110, 64),
  ('Medicine & Surgery (MChD)', 5.0, 'Graduate-entry program; GAMSAT required; competitive interview; bachelor''s degree prerequisite; highly selective', 'THE #51–100 Clinical & Health', 7.0, 100, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'AAA + GAMSAT', 42, 99.0, 120, 65),
  ('Arts (Asia-Pacific Studies)', 50.0, 'Standard university application; unique regional focus through ANU College of Asia & the Pacific; no prerequisites', 'QS #4 Asian Studies', 6.0, 85, NULL::INTEGER, NULL::INTEGER, NULL::NUMERIC, 'BBC', 28, 78.0, 100, 58)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Australian National University';
