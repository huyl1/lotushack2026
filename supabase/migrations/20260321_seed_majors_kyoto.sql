-- Part 1: Update university-level data for Kyoto University
UPDATE public.universities SET
  website_url = 'https://www.kyoto-u.ac.jp/en/education-campus/education-and-admissions',
  tuition_usd = 3695,
  overall_acceptance_rate = '~11%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Kyoto iUP: Nov 4 - Dec 4; Civil Engineering Program: Jan (guidelines published mid-Jan previous year); Regular (Japanese-taught): Jan-Feb',
  financial_aid = 'Need-aware. Full/partial tuition fee waivers available. MEXT scholarship (full tuition + ~$800/mo stipend). Kyoto iUP merit scholarship: full admission/tuition waiver + up to JPY 120,000/mo (~$830/mo). JASSO scholarships available.'
WHERE name = 'Kyoto University';

-- Part 2: Insert top 10 majors for Kyoto University
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
  ('Engineering (Civil, Environmental and Resources)', 5.0, 'Kyoto iUP application screening + interview; or International Civil Engineering Program application (separate track). No Japanese required at entry for iUP/International Course.', 'QS #65 World (Engineering & Technology)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Physics and Astrophysics', 5.0, 'Kyoto iUP application: document screening + interview. Faculty of Science placement. Strong background in physics and mathematics required.', 'QS #29 World (Physics & Astronomy)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Chemistry', 5.0, 'Kyoto iUP application: document screening + interview. Faculty of Science placement. Strong background in chemistry and mathematics expected.', 'QS Top 100 World (Chemistry)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Economics', 8.0, 'Kyoto iUP application: document screening + interview. Faculty of Economics placement. Background in mathematics recommended.', 'QS #78 World (Economics & Econometrics)', 6.5, 90, NULL, NULL, 3.3, 'AAB', 30, NULL, NULL, NULL),
  ('Law', 7.0, 'Kyoto iUP application: document screening + interview. Faculty of Law placement. Covers international relations, law, and politics.', 'QS #58 World (Law & Legal Studies)', 6.5, 90, NULL, NULL, 3.3, 'AAB', 30, NULL, NULL, NULL),
  ('Medicine', 3.0, 'Not available through Kyoto iUP. Regular admission requires EJU (Examination for Japanese University Admission) and Japanese proficiency. Six-year program.', 'QS #72 World (Medicine)', 6.5, 90, NULL, NULL, 3.8, 'A*A*A', 36, NULL, NULL, NULL),
  ('Biological Sciences', 6.0, 'Kyoto iUP application: document screening + interview. Faculty of Science placement. Strong background in biology and chemistry expected.', 'QS #53 World (Biological Sciences)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Mathematics', 5.0, 'Kyoto iUP application: document screening + interview. Faculty of Science placement. Exceptional mathematical aptitude required.', 'QS #55 World (Mathematics)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Pharmaceutical Sciences', 6.0, 'Kyoto iUP application: document screening + interview. Faculty of Pharmaceutical Sciences. Strong chemistry and biology background required.', 'QS #100 World (Pharmacy & Pharmacology)', 6.5, 90, NULL, NULL, 3.5, 'AAA', 32, NULL, NULL, NULL),
  ('Agriculture', 8.0, 'Kyoto iUP application: document screening + interview. Faculty of Agriculture placement. Covers bioresource science, applied life sciences, forest science, and food/environmental economics.', 'QS Top 50 World (Agriculture & Forestry)', 6.5, 90, NULL, NULL, 3.3, 'AAB', 30, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Kyoto University';
