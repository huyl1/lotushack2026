-- Part 1: University-level data for Freie Universität Berlin
UPDATE public.universities SET
  website_url = 'https://www.fu-berlin.de/en/',
  tuition_usd = 775,
  overall_acceptance_rate = '~15%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Winter semester (Oct start): July 15 (restricted), Sept 1 (unrestricted); Summer semester (Apr start): Jan 15. Non-EU applicants must also apply for VPD via uni-assist by July 15. Master''s restricted programs: May 31. Most programs admit for winter semester only.',
  financial_aid = 'No tuition fees for all students (only ~€359/semester contribution including Deutschlandsemesterticket). Deutschlandstipendium (€300/month merit-based, open to all nationalities). DAAD STIBET I scholarships (€250/month for students with disabilities, caregiving, or refugee background). DAAD full scholarships for international students. Erasmus+ mobility grants. Blocked account of ~€11,904/year required for student visa.'
WHERE name = 'Freie Universität Berlin';

-- Part 2: Top 10 majors for Freie Universität Berlin
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Politics & International Studies', 10.0, 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); Otto-Suhr-Institut is one of Europe''s largest political science departments; motivation letter required; some graduate modules in English', 'QS #32 World; #1 Germany', NULL, NULL, NULL, NULL, 1.5, 'A*A*A', 38, 98.0, NULL, NULL),
  ('Archaeology', 20.0, 'Admission-free (no NC); German C1 required (DSH-2 or TestDaF 4x4); Latinum or Graecum may be required depending on specialisation; covers classical, prehistoric, and Near Eastern archaeology', 'QS #23 World; #1 Germany', NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, 93.0, NULL, NULL),
  ('Classics & Ancient History (Altertumswissenschaften)', 25.0, 'Admission-free (no NC); German C1 required (DSH-2 or TestDaF 4x4); Latinum and/or Graecum required; strong humanities background expected', 'QS #24 World; #1 Germany', NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, 93.0, NULL, NULL),
  ('History (Geschichte)', 20.0, 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); Latinum recommended for ancient/medieval tracks; strong essay-writing skills expected', 'QS #30 World; #1 Germany', NULL, NULL, NULL, NULL, 2.0, 'AAA', 36, 96.0, NULL, NULL),
  ('Communication & Media Studies (Publizistik- und Kommunikationswissenschaft)', 8.0, 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); highly competitive with limited places; motivation letter and relevant experience may strengthen application', 'QS #30 World; #1 Germany', NULL, NULL, NULL, NULL, 1.5, 'A*A*A', 38, 98.0, NULL, NULL),
  ('Geography (Geographische Wissenschaften)', 15.0, 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); combines physical geography, human geography, and remote sensing; fieldwork components', 'QS #33 World; #1 Germany', NULL, NULL, NULL, NULL, 2.0, 'AAA', 36, 96.0, NULL, NULL),
  ('Philosophy', 25.0, 'Admission-free (no NC); German C1 required (DSH-2 or TestDaF 4x4); Latinum may be required; strong analytical and critical thinking skills expected; covers continental and analytic traditions', 'QS #34 World; #2 Germany', NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, 93.0, NULL, NULL),
  ('Modern Languages (Neuere Philologien)', 20.0, 'Admission varies by language (some restricted, some free); German C1 required (DSH-2 or TestDaF 4x4); proficiency in target language (e.g., English, French, Italian, Spanish) required; includes English Studies, Romance Languages, and German Studies', 'QS #43 World; #2 Germany', 6.5, 90, NULL, NULL, 2.0, 'AAA', 36, 96.0, 120, 65),
  ('Sociology', 12.0, 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); strong social sciences background recommended; quantitative methods component', 'QS #43 World; #2 Germany', NULL, NULL, NULL, NULL, 1.8, 'A*AA', 37, 97.0, NULL, NULL),
  ('Law (Rechtswissenschaft)', 10.0, 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); Staatsexamen program (no Bachelor/Master structure); strong written German essential; no English-taught option at undergraduate level', 'QS #65 World; #3 Germany', NULL, NULL, NULL, NULL, 1.5, 'A*A*A', 38, 98.0, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Freie Universität Berlin';
