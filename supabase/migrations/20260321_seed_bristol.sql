-- Part 1: University-level data for University of Bristol
UPDATE public.universities SET
  website_url = 'https://www.bristol.ac.uk/',
  tuition_usd = 36600,
  overall_acceptance_rate = '66.84%',
  test_policy = 'Not applicable',
  deadline_calendar = 'UCAS equal consideration deadline: January 14 (18:00 UK time). Medicine, Dentistry, Veterinary Science: October 15 (18:00 UK time). Final international undergraduate deadline: June 30. UCAS Extra: February 26 onward for applicants with no offers. Clearing opens July 2.',
  financial_aid = 'Think Big Scholarships: flagship international scholarship scheme offering £6,500 or £13,000/year tuition fee reduction for undergraduate students (renewable up to 4 years). Think Big Career Accelerator: additional employment program for postgraduate awardees. GREAT Scholarships available for select nationalities. R. Senathi Rajah Memorial Scholarship for Sri Lankan students (£26,000 tuition + £3,000 living). International Foundation Programme scholarships also available. Deadline: April 10, 2026.'
WHERE name = 'University of Bristol';

-- Part 2: Top 10 majors for University of Bristol
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', 52.5, 'A-level Mathematics required (A* grade); preference given to applicants with Further Mathematics, Physics, Computer Science, or related subjects; GCSE 20% and A-Level 80% weighting in scoring; personal statement assessed for academic interest and relevant activities', 'CUG #8 UK; THE #101-125 World', 6.5, 88, NULL, NULL, NULL, 'A*AA', 38, 95.0, 110, 67),
  ('Economics', 72.0, 'A-level Mathematics required (grade A); personal statement should demonstrate interest in economics and analytical thinking; Profile C English language requirement', 'CUG #41 UK; QS Top 150 World', 6.5, 88, NULL, NULL, NULL, 'A*AA', 38, 95.0, 110, 67),
  ('Law', 18.0, 'Personal statement must demonstrate genuine interest in law and analytical ability; essay-based A-level subject preferred; Profile B English language requirement (higher than most courses)', 'CUG #7 UK; THE #54 World', 7.0, 95, NULL, NULL, NULL, 'AAA', 36, 96.0, 120, 71),
  ('Aerospace Engineering', 64.7, 'A-level Mathematics (A*) and one of Physics, Chemistry, Further Mathematics, Computer Science, or Electronics (A) required; accredited by Royal Aeronautical Society; engineering maths test may be required for BTEC applicants', 'CUG #3 UK; QS Top 50 World', 6.5, 88, NULL, NULL, NULL, 'A*AA', 38, 95.0, 110, 67),
  ('Mechanical Engineering', 64.7, 'A-level Mathematics (A*) and one of Physics, Chemistry, Further Mathematics, Computer Science, or Electronics (A) required; accredited by Institution of Mechanical Engineers; dedicated Industrial Liaison Office for placements', 'CUG #4 UK; QS Top 100 World', 6.5, 88, NULL, NULL, NULL, 'A*AA', 38, 95.0, 110, 67),
  ('Mathematics', NULL, 'A-level Mathematics (A*) required plus A in another maths-related subject (Biology, Chemistry, Computer Science, Economics, Physics); STEP paper achievement may be included as part of alternative offer', 'CUG #6 UK; QS Top 100 World', 6.5, 88, NULL, NULL, NULL, 'A*A*A', 40, 97.0, 110, 67),
  ('Medicine (MBChB)', 9.6, 'UCAT required; work experience in healthcare settings expected; A-level Chemistry plus one of Biology, Physics, or Mathematics required; interview (MMI format); UCAS deadline October 15; 5-year program', 'CUG #8 UK; THE #55 World (Clinical & Health)', 7.0, 95, NULL, NULL, NULL, 'AAA', 36, 96.0, 120, 71),
  ('Business and Management', 8.9, 'UCAS personal statement demonstrating interest in business and management; A-level Mathematics required for some pathways; Profile C English language requirement', 'CUG #10 UK; QS Top 200 World', 6.5, 88, NULL, NULL, NULL, 'AAA', 36, 95.0, 110, 67),
  ('Psychology', 10.8, 'A-level in at least one science subject preferred; personal statement should demonstrate understanding of psychology as a science; BPS accredited; Profile B English language requirement', 'CUG #24 UK; THE #49 World', 7.0, 95, NULL, NULL, NULL, 'AAA', 36, 96.0, 120, 71),
  ('Electrical and Electronic Engineering', 64.7, 'A-level Mathematics (A*) and one of Physics, Chemistry, Further Mathematics, Computer Science, or Electronics (A) required; accredited by IET; shared first-year foundation with other engineering disciplines', 'CUG #9 UK (EEE); QS Top 150 World', 6.5, 88, NULL, NULL, NULL, 'A*AA', 38, 95.0, 110, 67)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Bristol';
