-- Part 1: University-level data for University of Texas at Austin
UPDATE public.universities SET
  website_url = 'https://admissions.utexas.edu/apply/international-students/',
  tuition_usd = 49912,
  overall_acceptance_rate = '27%',
  test_policy = 'Required',
  deadline_calendar = 'EA: Oct 15; RD: Dec 1. EA supplemental materials due Oct 22; RD supplemental materials due Dec 10. EA decisions by Jan 15; all decisions by Feb 15. Spring enrollment: Sep 1.',
  financial_aid = 'Need-aware for international students. Forty Acres Scholars Program: full tuition, living stipend, and enrichment funding (highly competitive). Presidential Scholars: $5k-$20k/yr merit-based. ISSS scholarships: $1k-$5k/semester (General ISSS Financial Aid, International Education Fee Scholarship, Iimura Peace Scholarship). Texas Advance Commitment covers free tuition for TX families under $65k. No CSS Profile required; FAFSA-based for domestic students.'
WHERE name = 'University of Texas at Austin';

-- Part 2: Top 10 majors for University of Texas at Austin
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science', 3.0, 'College of Natural Sciences application; SAT/ACT required; supplemental essays via ApplyTexas/Common App; major-specific admission — highly competitive; strong CS/programming extracurriculars recommended', 'US News #10; QS #11 World; ShanghaiRanking #8 World', 6.5, 79, 1480, 34, 3.9, 'A*A*A', 38, 99.0, NULL::INTEGER, NULL::INTEGER),
  ('Electrical and Computer Engineering', 5.0, 'Cockrell School of Engineering application; SAT/ACT required; supplemental essays; major-specific admission within engineering; strong math and physics background required', 'US News #9; QS #11 World (EE)', 6.5, 79, 1470, 33, 3.85, 'A*A*A', 38, 98.5, NULL, NULL),
  ('Finance', 6.0, 'McCombs School of Business application; SAT/ACT required; supplemental essay on business interests; admitted directly to McCombs — highly competitive (~11% admit rate for business overall)', 'US News #5; QS Top 25 World (Business)', 6.5, 79, 1470, 33, 3.85, 'A*A*A', 38, 98.5, NULL, NULL),
  ('Biology', 20.0, 'College of Natural Sciences application; SAT/ACT required; supplemental essays; admitted to CNS then declare biology major; pre-med track popular', 'QS Top 50 World (Life Sciences)', 6.5, 79, 1300, 29, 3.7, 'AAA', 34, 95.0, NULL, NULL),
  ('Mechanical Engineering', 8.0, 'Cockrell School of Engineering application; SAT/ACT required; supplemental essays; major-specific admission; strong math and science coursework required', 'US News Top 10; QS Top 50 World', 6.5, 79, 1450, 33, 3.85, 'A*AA', 37, 98.0, NULL, NULL),
  ('Economics', 18.0, 'College of Liberal Arts application; SAT/ACT required; supplemental essays; less restrictive admission than STEM/business but still competitive for out-of-state/intl', 'QS Top 50 World (Social Sciences)', 6.5, 79, 1300, 29, 3.7, 'AAA', 34, 95.0, NULL, NULL),
  ('Psychology', 20.0, 'College of Liberal Arts application; SAT/ACT required; supplemental essays; popular pre-med pathway; large enrollment program', 'US News Top 15; QS Top 50 World', 6.5, 79, 1280, 28, 3.65, 'AAA', 34, 94.0, NULL, NULL),
  ('Nursing', 8.0, 'School of Nursing application; SAT/ACT required; supplemental essays on healthcare goals; direct-entry BSN program; prerequisite science courses required; clinical placement component', 'US News Top 15', 6.5, 79, 1400, 31, 3.8, 'A*AA', 36, 97.0, NULL, NULL),
  ('Communication Studies', 22.0, 'Moody College of Communication application; SAT/ACT required; supplemental essays; Advertising/PR tracks are most competitive within Moody; large program with strong industry connections in Austin', 'US News #1 (Advertising); QS #3 World (Communication & Media)', 6.5, 79, 1280, 28, 3.65, 'AAA', 34, 94.0, NULL, NULL),
  ('Government', 20.0, 'College of Liberal Arts application; SAT/ACT required; supplemental essays; LBJ School connection for policy-oriented students; Austin location provides state capitol access', 'QS Top 50 World (Politics)', 6.5, 79, 1280, 28, 3.65, 'AAA', 34, 94.0, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'University of Texas at Austin';
