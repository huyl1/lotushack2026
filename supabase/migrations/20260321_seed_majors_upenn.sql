-- Part 1: Update University of Pennsylvania data
UPDATE public.universities SET
  website_url = 'https://www.upenn.edu',
  tuition_usd = 63204,
  overall_acceptance_rate = '4.9%',
  test_policy = 'Test Required (SAT or ACT mandatory from 2025-26 cycle onward)',
  deadline_calendar = 'Early Decision: November 1; Regular Decision: January 5; Transfer: March 15',
  financial_aid = 'Need-blind admissions; meets 100% of demonstrated financial need with no loans. Quaker Commitment: full tuition guaranteed for families earning up to $200,000 with typical assets; home equity excluded from asset calculations.'
WHERE name = 'University of Pennsylvania';

-- Part 2: Replace majors
DELETE FROM public.majors WHERE university_id = (SELECT id FROM public.universities WHERE name = 'University of Pennsylvania');

INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Finance (Wharton)', '4%', 'Wharton School application; supplemental essay on how a Wharton education applies to real-world problems', 'US News #1 Undergraduate Business; QS #9 World (Business & Management)', 7.0, 100, 1510, 34, 3.9, 'A*A*A', 38, 99.0, 130, 68),
  ('Economics (BS)', '4%', 'Wharton School application; supplemental essay on how a Wharton education applies to real-world problems', 'US News #1 Undergraduate Business; QS #16 World (Economics)', 7.0, 100, 1510, 34, 3.9, 'A*A*A', 38, 99.0, 130, 68),
  ('Computer Science', '3%', 'School of Engineering and Applied Science application; supplemental essay on engineering interests within intended major', 'THE #39 World (Computer Science); US News Top 20 CS', 7.0, 100, 1520, 34, 3.9, 'A*A*A', 39, 99.0, 130, 68),
  ('Bioengineering', '3%', 'School of Engineering and Applied Science application; supplemental essay on engineering interests; strong math and science background required', 'US News #12 (Biomedical Engineering); QS Top 100 World', 7.0, 100, 1520, 34, 3.9, 'A*A*A', 39, 99.0, 130, 68),
  ('Nursing (BSN)', '6%', 'School of Nursing application; supplemental essay on healthcare equity and personal career goals', 'QS #1 World (Nursing); US News #2 Nursing', 7.0, 100, 1500, 34, 3.9, 'A*A*A', 38, 99.0, 130, 68),
  ('Biology', '5%', 'College of Arts & Sciences application; Penn-specific supplemental essay required', 'THE #17 World (Life Sciences)', 7.0, 100, 1510, 34, 3.9, 'A*A*A', 38, 99.0, 130, 68),
  ('Political Science', '5%', 'College of Arts & Sciences application; Penn-specific supplemental essay required', 'THE #13 World (Social Sciences & Management)', 7.0, 100, 1510, 34, 3.9, 'A*A*A', 38, 99.0, 130, 68),
  ('Philosophy', '5%', 'College of Arts & Sciences application; Penn-specific supplemental essay required; demonstrated interest in analytical reasoning', 'QS #16 World (Arts & Humanities)', 7.0, 100, 1500, 34, 3.9, 'A*AA', 37, 98.5, 130, 68),
  ('Psychology', '5%', 'College of Arts & Sciences application; Penn-specific supplemental essay required', 'THE #8 World (Psychology)', 7.0, 100, 1500, 34, 3.9, 'A*AA', 37, 98.5, 130, 68),
  ('Health and Societies', '5%', 'College of Arts & Sciences application; Penn-specific supplemental essay required; interdisciplinary focus on public health and social sciences', 'US News Top 10 (Public Health Programs)', 7.0, 100, 1500, 34, 3.9, 'A*AA', 37, 98.5, 130, 68)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Pennsylvania';
