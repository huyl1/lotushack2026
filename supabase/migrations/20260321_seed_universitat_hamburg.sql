-- Part 1: University-level data for Universität Hamburg
UPDATE public.universities SET
  website_url = 'https://www.uni-hamburg.de/en.html',
  tuition_usd = 700,
  overall_acceptance_rate = '40%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Winter semester (Oct start): July 15 via uni-assist; Summer semester (Apr start): January 15 via uni-assist. Restricted programs (Medicine, Psychology) apply via hochschulstart.de. Most programs admit for winter semester only.',
  financial_aid = 'No tuition fees for all students (only ~€350/semester contribution including HVV public transit ticket). Deutschlandstipendium (€300/month merit-based, open to all nationalities). DAAD scholarships for international students. Hamburg Foundation scholarships. Emergency aid from Studierendenwerk Hamburg. Blocked account of ~€11,904/year required for student visa.'
WHERE name = 'Universität Hamburg';

-- Part 2: Top 10 majors for Universität Hamburg
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine (Medizin)', '5%', 'Numerus clausus (NC) ~1.0 Abitur equivalent; apply via hochschulstart.de; German C1-C2 required (DSH-2 or TestDaF 4x4); 6-year Staatsexamen program; highly competitive with very limited places', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 1.0::numeric, 'A*A*A*', 40, 99.5::numeric, NULL::int, NULL::int),
  ('Law (Rechtswissenschaft)', '20%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); Staatsexamen program; no English-taught option at undergraduate level', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 1.5::numeric, 'A*A*A', 38, 98.0::numeric, NULL::int, NULL::int),
  ('Computer Science (Informatik)', '25%', 'Locally restricted admission (NC) in recent semesters; German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics background essential', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.0::numeric, 'AAA', 36, 96.0::numeric, NULL::int, NULL::int),
  ('Business Administration (Betriebswirtschaftslehre)', '30%', 'German C1-C2 required (DSH-2 or TestDaF 4x4); offered via Hamburg Business School; quantitative background recommended', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.0::numeric, 'AAA', 36, 96.0::numeric, NULL::int, NULL::int),
  ('Psychology', '8%', 'Highly competitive NC (~1.2-1.4 Abitur equivalent); German C1-C2 required (DSH-2 or TestDaF 4x4); apply via hochschulstart.de; strong science background recommended', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 1.3::numeric, 'A*A*A', 39, 99.0::numeric, NULL::int, NULL::int),
  ('Biology', '25%', 'Admission-free (no NC) in some semesters; German C1-C2 required (DSH-2 or TestDaF 4x4); laboratory components from first semester; strong natural sciences background', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.0::numeric, 'AAA', 36, 96.0::numeric, NULL::int, NULL::int),
  ('Physics', '30%', 'Admission-free (no NC); German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics and physics background required; Hamburg Physics Centre and DESY partnership', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.5::numeric, 'AAB', 34, 93.0::numeric, NULL::int, NULL::int),
  ('Chemistry', '30%', 'Admission-free (no NC); German C1-C2 required (DSH-2 or TestDaF 4x4); laboratory-intensive program; links to DESY and HZG research centres', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.5::numeric, 'AAB', 34, 93.0::numeric, NULL::int, NULL::int),
  ('International Business (English)', '20%', 'English-taught program; IELTS 6.5 / TOEFL 90 required; B.Sc. program taught entirely in English; German language skills beneficial but not mandatory; competitive NC applies', NULL::int, 6.5::numeric, 90::int, NULL::int, NULL::int, 2.0::numeric, 'AAA', 36, 96.0::numeric, NULL::int, NULL::int),
  ('Economics (Volkswirtschaftslehre)', '25%', 'German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics background recommended; Hamburg has a strong research focus on economics and finance', NULL::int, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.0::numeric, 'AAA', 36, 96.0::numeric, NULL::int, NULL::int)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universität Hamburg';
