-- Part 1: University-level data for University of Birmingham
UPDATE public.universities SET
  website_url = 'https://www.birmingham.ac.uk/study/international',
  tuition_usd = 35600,
  overall_acceptance_rate = '~77%',
  test_policy = 'Not applicable',
  deadline_calendar = 'UCAS equal consideration deadline: January 14 (18:00 UK time). Medicine and Dentistry: October 15 (18:00 UK time). Final international undergraduate deadline: June 30. UCAS Extra: February 26 onward for applicants with no offers. Clearing opens July.',
  financial_aid = 'Need-aware for international students. Over £10.5 million in scholarships available for international students. Engineering International Excellence Scholarship: £3,000 fee waiver for qualifying engineering students. Europe High Fliers Undergraduate Scholarships for EU students. Subject-specific scholarships ranging from £1,500–£8,000. US Federal Direct Loans and Canada Student Loans accepted. Various country-specific and region-specific scholarships available.'
WHERE name = 'University of Birmingham';

-- Part 2: Top 10 majors for University of Birmingham
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', NULL, 'A-level Mathematics grade A required; General Studies and Critical Thinking not accepted; Group A English language requirements; ranked 1st in UK by Daily Mail University Guide 2026 and 5th by Complete University Guide 2026', 'CUG #5 UK; THE #176-200 World', 6.0, 80, NULL, NULL, NULL, 'A*AA', 32, NULL, NULL, 64),
  ('Mechanical Engineering', NULL, 'A-level Mathematics required; Further Mathematics and Physics advantageous but not required; Mathematics Aptitude Test may be required for non-A-level maths applicants; Group A English language requirements', 'CUG #9 UK; QS Top 100 World', 6.0, 80, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 64),
  ('Medicine and Surgery (MBChB)', 46.5, 'UCAT required in year of application; interview required; A-level Biology/Human Biology and Chemistry required; seven GCSEs including English, Mathematics, Biology, Chemistry at grade 6+; UCAS deadline October 15; up to 28 international places; 5-year programme; DBS check required', 'QS #59 World (Medicine)', 7.0, 95, NULL, NULL, NULL, 'A*AA', 36, NULL, NULL, 76),
  ('Economics', NULL, 'A-level Mathematics required (grade A); Business School English language requirements: TOEFL 88 with minimum 22 in all skills; IELTS 6.5 with no less than 6.0 in any band; GCSE Mathematics grade 7/A preferred', 'CUG #17 UK; THE #99 World (Business and Economics)', 6.5, 88, NULL, NULL, NULL, 'AAA', 32, NULL, NULL, 67),
  ('Law (LLB)', NULL, 'No specific subject requirements; Group B English language requirements; personal statement assessed for analytical ability and genuine interest in law; BTEC Extended Diploma in Business or Law at D*D*D* considered', 'CUG Top 20 UK', 6.5, 88, NULL, NULL, NULL, 'AAA', 32, NULL, NULL, 67),
  ('Business Management', NULL, 'Business School English language requirements apply (IELTS 6.5 / TOEFL 88); GCSE Mathematics grade 5/B and English grade 6/B required; personal statement demonstrating business awareness and leadership', 'CUG Top 25 UK; QS #143 World (Business)', 6.5, 88, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 67),
  ('Psychology', NULL, 'A-level in at least one science subject required (Chemistry, Biology, Physics, Psychology, Maths, Further Maths, or Statistics); without a science: AAA required instead of AAB; Group B English language requirements; BPS accredited', 'QS Top 100 World; CUG #18 UK', 6.5, 88, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 67),
  ('Electrical and Electronic Engineering', NULL, 'A-level Mathematics required; Physics advantageous; Mathematics Aptitude Test may be required for non-A-level maths applicants; Group A English language requirements; accredited by IET', 'CUG Top 10 UK', 6.0, 80, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 64),
  ('Chemical Engineering', NULL, 'A-level Mathematics and Chemistry required; Group A English language requirements; accredited by IChemE; strong industry links with placement opportunities', 'CUG #6 UK', 6.0, 80, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 64),
  ('Biomedical Science', NULL, 'A-level Biology or Chemistry required plus a second science; GCSE Mathematics and English at grade 4/C; Group B English language requirements; laboratory-based programme with practical skills development', 'QS #59 World (Life Sciences and Medicine)', 6.5, 88, NULL, NULL, NULL, 'AAB', 32, NULL, NULL, 67)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Birmingham';
