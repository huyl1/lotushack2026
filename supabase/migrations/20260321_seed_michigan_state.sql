-- Part 1: University-level data for Michigan State University
UPDATE public.universities SET
  website_url = 'https://admissions.msu.edu',
  tuition_usd = 42174,
  overall_acceptance_rate = '78%',
  test_policy = 'Test-Optional',
  deadline_calendar = 'Priority: November 1; Regular: Rolling admissions. International application deadline: November 1. Decisions released on a rolling basis starting October.',
  financial_aid = 'Need-aware for international students. MSU International Merit Scholarships: $2k-$6k/yr for high-achieving international students. Alumni Distinguished Scholarship: up to full tuition (highly competitive, requires separate application). College-specific scholarships vary by program. No CSS Profile required for domestic; FAFSA-based for domestic. International students encouraged to apply early for limited merit aid.'
WHERE name = 'Michigan State University';

-- Part 2: Top 10 majors for Michigan State University
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Computer Science'::text, '55%'::text, 'Admission to College of Engineering required; declare CS major after enrollment; strong math and programming coursework recommended; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Business Administration'::text, '65%'::text, 'Broad College of Business secondary admission process; online application required after first semester; minimum GPA in business precore courses; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Accounting'::text, '50%'::text, 'Broad College of Business competitive admission major; grades in ACC 201 and ACC 202 are primary criteria; online major application required; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Supply Chain Management'::text, '50%'::text, 'Broad College of Business competitive admission major; cumulative GPA and major precore GPA considered; online major application required; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Mechanical Engineering'::text, '65%'::text, 'College of Engineering admission required; capacity-constrained major; strong math and physics background recommended; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Electrical Engineering'::text, '65%'::text, 'College of Engineering admission required; capacity-constrained major; strong math, physics, and programming background recommended; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Biology'::text, '75%'::text, 'College of Natural Science; open enrollment major; prerequisites in biology and chemistry required for upper-division courses; pre-med pathway popular; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Psychology'::text, '78%'::text, 'College of Social Science; open enrollment major; prerequisites in introductory psychology and statistics required; large program with research opportunities; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Communication'::text, '70%'::text, 'College of Communication Arts and Sciences; open enrollment with course prerequisites; strong writing and public speaking coursework recommended; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer),
  ('Nursing (BSN)'::text, '40%'::text, 'Capacity-constrained; Accelerated Nursing Program (ABSN) or traditional BSN; prerequisite science courses required; clinical placement component; competitive GPA required; test-optional'::text, NULL::integer, 6.5::numeric, 80::integer, 1100::integer, 26::integer, 3.5::numeric, NULL::text, 28::integer, NULL::numeric, 105::integer, 53::integer)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Michigan State University';
