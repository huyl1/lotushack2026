-- Part 1: University-level data for King Abdul Aziz University (KAU)
-- KAU is a public Saudi university; tuition is government-subsidised.
-- International undergraduate students pay approximately SAR 9,000/year (~$2,400 USD at 3.75 SAR/USD).
-- test_policy set to 'Not applicable' per task instructions.
UPDATE public.universities SET
  website_url = 'https://www.kau.edu.sa',
  tuition_usd = 2400,
  overall_acceptance_rate = '35%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Applications for the Fall semester (September entry) open in May and close in late July. International applicants must apply through the Deanship of Admission and Registration portal at apply.kau.edu.sa. Documents required: certified secondary school certificate, passport copy, medical fitness certificate, and English proficiency test results. Academic year runs September to June (two semesters). No rolling admissions; all applications reviewed after the deadline.',
  financial_aid = 'KAU offers government-funded scholarships for outstanding international students covering full tuition, accommodation, monthly stipend (SAR 850/month), and round-trip airfare. The King Salman Scholarship Programme and KAU Excellence Scholarship are available to high-achieving international applicants. Saudi nationals receive free tuition under the Ministry of Education funding. Limited need-based financial assistance is available through the Deanship of Student Affairs.'
WHERE name = 'King Abdul Aziz University (KAU)';

-- Part 2: Top 10 undergraduate majors for King Abdul Aziz University (KAU)
-- SAT/ACT/ATAR not used; subject_ranking is an integer (QS world subject rank position).
-- acceptance_rate is text (percentage string).
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science',       '30%', 'Minimum 90% in secondary school; strong Mathematics background required; personal statement in Arabic or English; completed via KAU online admissions portal; interview may be required for scholarship applicants', 225, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50),
  ('Electrical Engineering', '28%', 'Minimum 90% in secondary school; strong Physics and Mathematics required; personal statement; completed via KAU online admissions portal; practical/lab readiness assessed', 175, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50),
  ('Medicine (MBBS)',        '15%', 'Minimum 95% in secondary school (science stream); Biology and Chemistry required at secondary level; personal statement; medical fitness certificate; interview required; highly competitive admission', 290, 5.5, 79, NULL, NULL, 3.5, 'ABB', 32, NULL, 95, 55),
  ('Civil Engineering',      '32%', 'Minimum 88% in secondary school; Mathematics and Physics required; personal statement; completed via KAU online admissions portal', 225, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50),
  ('Business Administration','35%', 'Minimum 85% in secondary school; no specific subject prerequisites; personal statement demonstrating interest in business; completed via KAU online admissions portal', 300, 5.0, 61, NULL, NULL, 3.0, 'BBC', 27, NULL, 85, 50),
  ('Biochemistry',           '30%', 'Minimum 88% in secondary school; Biology and Chemistry required at secondary level; personal statement; completed via KAU online admissions portal', 275, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50),
  ('Pharmacy (B.Pharm)',     '20%', 'Minimum 92% in secondary school (science stream); Biology and Chemistry required; personal statement; medical fitness certificate; interview may be required', 380, 5.5, 71, NULL, NULL, 3.2, 'ABB', 30, NULL, 95, 55),
  ('Economics',              '38%', 'Minimum 85% in secondary school; Mathematics recommended; personal statement; completed via KAU online admissions portal', 300, 5.0, 61, NULL, NULL, 3.0, 'BBC', 27, NULL, 85, 50),
  ('Architecture',           '30%', 'Minimum 88% in secondary school; Mathematics and Art/Drawing background preferred; portfolio of creative/design work required; personal statement; completed via KAU online admissions portal', 300, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50),
  ('Information Technology', '33%', 'Minimum 87% in secondary school; Mathematics required; personal statement; completed via KAU online admissions portal; basic programming aptitude assessed', 225, 5.0, 61, NULL, NULL, 3.0, 'BBB', 28, NULL, 90, 50)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'King Abdul Aziz University (KAU)';
