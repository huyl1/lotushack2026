-- Part 1: University-level data for Eberhard Karls Universität Tübingen
UPDATE public.universities SET
  website_url = 'https://uni-tuebingen.de/en/',
  tuition_usd = 3300,
  overall_acceptance_rate = '20-30%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Winter semester (Oct start): July 15; Summer semester (Apr start): January 15. Non-EU international students apply via ALMA online portal directly to the university. Restricted programs (Medicine, Dentistry, Pharmacy) apply via hochschulstart.de. Early application recommended for visa processing.',
  financial_aid = 'Non-EU international students pay €1,500 per semester (€3,000/year) in tuition fees; EU/EEA students pay only the semester fee (~€197.80/semester). Deutschlandstipendium (€300/month merit-based); DAAD scholarships available for various nationalities; Baden-Württemberg State Scholarships; Studierendenwerk Tübingen-Hohenheim emergency aid; blocked account of ~€11,904/year required for student visa.'
WHERE name = 'Eberhard Karls Universität Tübingen';

-- Part 2: Top 10 majors for Eberhard Karls Universität Tübingen
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('International Economics (B.Sc.)', '25%', 'Open admission (no NC); program taught with significant English content; German language skills advantageous but not required for core modules; strong mathematics background recommended; one mandatory semester abroad; apply via ALMA portal by September 30', 51, 6.5, 79, NULL::int, NULL::int, 2.5::numeric, 'AAB', 34, NULL::numeric, 110, 62),
  ('Medicine (Medizin / Staatsexamen)', '3%', 'Highly competitive NC (~1.0 Abitur equivalent); apply via hochschulstart.de; TMS (Test für Medizinische Studiengänge) strongly recommended; German C1-C2 required (DSH-2 or TestDaF 4x4); 6-year Staatsexamen program; ranked among Germany''s top medical schools', 1, NULL::numeric, NULL::int, NULL::int, NULL::int, 1.0::numeric, 'A*A*A*', 40, NULL::numeric, NULL::int, NULL::int),
  ('Computer Science (Informatik, B.Sc.)', '20%', 'Locally restricted admission (NC) in recent semesters; German C1-C2 required (DSH-2 or TestDaF 4x4); strong mathematics background essential; apply via ALMA portal', 51, NULL, NULL, NULL, NULL, 2.0, 'A*AA', 36, NULL, NULL, NULL),
  ('Biology (B.Sc.)', '20%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); strong natural sciences background recommended; laboratory work from first semester; Tübingen is a leading centre for molecular biology research', 35, NULL, NULL, NULL, NULL, 2.0, 'AAA', 36, NULL, NULL, NULL),
  ('Biochemistry (B.Sc.)', '22%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); strong chemistry and biology background required; Tübingen has renowned biochemistry and molecular biology institutes', 42, NULL, NULL, NULL, NULL, 2.0, 'AAA', 35, NULL, NULL, NULL),
  ('Psychology (B.Sc.)', '8%', 'Highly competitive NC; German C1-C2 required (DSH-2 or TestDaF 4x4); strong interest in natural science methods required; apply via ALMA portal; Tübingen Psychology is among the best in Germany', 28, NULL, NULL, NULL, NULL, 1.5, 'A*A*A', 38, NULL, NULL, NULL),
  ('Political Science (B.A.)', '25%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); some modules taught in English; strong humanities and social sciences background recommended; apply via ALMA portal by July 15', 45, 6.5, 79, NULL, NULL, 2.0, 'AAB', 34, NULL, 110, 62),
  ('Philosophy (B.A.)', '30%', 'Admission-free (no NC) in most semesters; German C1-C2 required (DSH-2 or TestDaF 4x4); Latinum may be required for certain specialisations; Tübingen has a distinguished tradition in philosophy dating to the German Idealism period', 38, NULL, NULL, NULL, NULL, 2.5, 'ABB', 33, NULL, NULL, NULL),
  ('Geoscience / Geoecology (B.Sc.)', '30%', 'Open or locally restricted admission depending on semester; German C1-C2 required (DSH-2 or TestDaF 4x4); fieldwork component included from early semesters; strong natural sciences background (geography, chemistry, biology) recommended', 55, NULL, NULL, NULL, NULL, 2.5, 'ABB', 33, NULL, NULL, NULL),
  ('Pharmacy (Pharmazie / Staatsexamen)', '5%', 'Highly competitive NC; apply via hochschulstart.de; German C1-C2 required (DSH-2 or TestDaF 4x4); 4-year Staatsexamen program; strong chemistry background required; Tübingen Pharmacy faculty is well-regarded in Germany', 22, NULL, NULL, NULL, NULL, 1.3, 'A*A*A', 39, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Eberhard Karls Universität Tübingen';
