-- Part 1: University-level data for Ludwig-Maximilians-Universität München
UPDATE public.universities SET
  website_url = 'https://www.lmu.de/en/',
  tuition_usd = 92,
  overall_acceptance_rate = '10-15%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Winter semester (Oct start): July 15; Summer semester (Apr start): January 15. International applicants apply via uni-assist portal. Restricted programs (Medicine, Law, Psychology, Business) may have earlier deadlines via hochschulstart.de.',
  financial_aid = 'No tuition fees for all students (only ~€85 semester contribution). Deutschlandstipendium (€300/month merit-based); DAAD scholarships; Bavarian State Study Scholarship (via International Office); BESUD Scholarship for developing-country students; LMU Nothilfe emergency aid (€650 one-time). Blocked account of ~€11,904/year required for student visa.'
WHERE name = 'Ludwig-Maximilians-Universität München';

-- Part 2: Top 10 majors for Ludwig-Maximilians-Universität München
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Medicine (Medizin)', '2%', 'Numerus clausus (NC) ~1.0 Abitur equivalent required; apply via hochschulstart.de; TMS (Test für Medizinische Studiengänge) strongly recommended; German C1-C2 required (DSH-2 or TestDaF 4x4); 6-year Staatsexamen program', 2, NULL::numeric, NULL::int, NULL::int, NULL::int, 1.0::numeric, 'A*A*A*', 40, 99.5::numeric, NULL::int, NULL::int),
  ('Law (Rechtswissenschaft)', '8%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); Staatsexamen program; no English-taught option at undergraduate level', 2, NULL, NULL, NULL, NULL, 1.5, 'A*A*A', 38, 98.0, NULL, NULL),
  ('Business Administration (Betriebswirtschaftslehre)', '10%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); aptitude assessment may apply; strong quantitative background recommended', 3, NULL, NULL, NULL, NULL, 1.8, 'A*AA', 37, 97.0, NULL, NULL),
  ('Economics (Volkswirtschaftslehre)', '15%', 'German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics background recommended; admission-free in recent semesters but may vary', 2, NULL, NULL, NULL, NULL, 2.0, 'AAA', 36, 96.0, NULL, NULL),
  ('Physics', '20%', 'Admission-free (no NC); German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics and physics background required; part of LMU''s Elite Network Bavaria program in Theoretical and Mathematical Physics', 1, NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, 93.0, NULL, NULL),
  ('Computer Science (Informatik)', '12%', 'Locally restricted admission (NC) in recent semesters; German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics background essential; aptitude assessment may be required', 3, NULL, NULL, NULL, NULL, 1.8, 'A*AA', 37, 96.0, NULL, NULL),
  ('Biology', '15%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); laboratory components from first semester; IB Biology HL recommended', 1, 6.5, 90, NULL, NULL, 2.0, 'AAA', 36, 96.0, 120, 65),
  ('Psychology', '5%', 'Highly competitive NC (~1.1-1.3 Abitur equivalent); German C1-C2 required (DSH-2 or TestDaF 4x4); apply via hochschulstart.de for centrally restricted places; strong science background recommended', 1, NULL, NULL, NULL, NULL, 1.3, 'A*A*A', 39, 99.0, NULL, NULL),
  ('Philosophy', '25%', 'Admission-free (no NC); German C1-C2 required (DSH-2 or TestDaF 4x4); Latinum or Graecum may be required depending on specialisation; strong humanities background', 1, NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, 93.0, NULL, NULL),
  ('Political Science (Politikwissenschaft)', '15%', 'Locally restricted admission (NC); German B2-C1 required; some modules available in English; aptitude assessment may apply; strong social sciences background recommended', 3, 6.5, 90, NULL, NULL, 2.0, 'AAA', 36, 96.0, 120, 65)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Ludwig-Maximilians-Universität München';
