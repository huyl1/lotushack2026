-- Part 1: University-level data for Universität Erlangen-Nürnberg (FAU)
UPDATE public.universities SET
  website_url = 'https://www.fau.eu',
  tuition_usd = 185,
  overall_acceptance_rate = '~30%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Winter semester (Oct start): July 15 (restricted programs), September 15 (unrestricted); Summer semester (Apr start): January 15 (restricted), March 15 (unrestricted). International applicants from non-EU countries apply via uni-assist. Engineering and Science programs often restricted via local NC. Medicine/Dentistry/Pharmacy apply via hochschulstart.de.',
  financial_aid = 'No tuition fees (German public university). Semester contribution ~€170–180 (~$185 USD) per semester covering administrative fees and semester ticket. Deutschlandstipendium (€300/month merit-based, open to all nationalities). DAAD scholarships for international students. Bavarian State Scholarship (Bayerisches Begabtenstipendium) for high achievers. FAU Familienbüro support grants. Blocked account of ~€11,904/year required for non-EU student visa.'
WHERE name = 'Universität Erlangen-Nürnberg';

-- Part 2: Top 10 majors for Universität Erlangen-Nürnberg (FAU)
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Mechanical Engineering (Maschinenbau)', '35%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); strong mathematics and physics background essential; 6-semester Bachelor program; part of FAU''s engineering excellence', 201, NULL::numeric, NULL::int, NULL::int, NULL::int, 2.0::numeric, 'AAB', 34, NULL::numeric, NULL::int, NULL::int),
  ('Electrical Engineering (Elektrotechnik)', '30%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); strong mathematics and physics required; 6-semester Bachelor leading to B.Sc.; specialisations in energy systems, electronics, and communications', 201, NULL, NULL, NULL, NULL, 2.0, 'AAB', 34, NULL, NULL, NULL),
  ('Computer Science (Informatik)', '25%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); aptitude test (Eignungsfeststellungsverfahren) may apply; 6-semester B.Sc. program; strong focus on theoretical and applied computing', 251, NULL, NULL, NULL, NULL, 2.0, 'AAB', 34, NULL, NULL, NULL),
  ('Medicine (Medizin)', '4%', 'Highly competitive NC (~1.0 Abitur equivalent); apply via hochschulstart.de; German C1-C2 required (DSH-2 or TestDaF 4x4); TMS (Test für Medizinische Studiengänge) strongly recommended; 6-year Staatsexamen; Universitätsklinikum Erlangen as teaching hospital', 251, NULL, NULL, NULL, NULL, 1.0, 'A*A*A*', 40, NULL, NULL, NULL),
  ('Physics', '40%', 'Admission-free (no NC) in most semesters; German C1 required (DSH-2 or TestDaF 4x4); strong mathematics background required; 6-semester B.Sc.; FAU is part of the Erlangen Centre for Astroparticle Physics (ECAP)', 151, NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, NULL, NULL, NULL),
  ('Chemistry and Biochemistry (Chemie)', '40%', 'Admission-free (no NC); German C1 required (DSH-2 or TestDaF 4x4); laboratory components from first semester; 6-semester B.Sc.; research-intensive with strong industry links to BASF and Siemens', 201, NULL, NULL, NULL, NULL, 2.5, 'AAB', 34, NULL, NULL, NULL),
  ('Business Administration (Betriebswirtschaftslehre)', '20%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); School of Business, Economics and Society (WiSo); aptitude assessment may apply; quantitative background recommended', 251, NULL, NULL, NULL, NULL, 1.8, 'A*AA', 36, NULL, NULL, NULL),
  ('Law (Rechtswissenschaft)', '15%', 'Locally restricted admission (NC); German C1-C2 required (DSH-2 or TestDaF 4x4); Staatsexamen program (no B.Sc./B.A. structure); strong written German essential; no English-taught undergraduate option', 251, NULL, NULL, NULL, NULL, 1.5, 'A*AA', 37, NULL, NULL, NULL),
  ('Materials Science and Engineering (Werkstoffwissenschaften)', '35%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); strong physics and chemistry background required; 6-semester B.Sc.; FAU is a world leader in materials research (New Materials cluster of excellence)', 101, NULL, NULL, NULL, NULL, 2.0, 'AAB', 34, NULL, NULL, NULL),
  ('Industrial Engineering (Wirtschaftsingenieurwesen)', '25%', 'Locally restricted admission (NC); German C1 required (DSH-2 or TestDaF 4x4); combines engineering and business disciplines; aptitude test (Eignungsfeststellungsverfahren) may apply; 7-semester B.Sc.; strong industry partnerships in Bavaria', 201, NULL, NULL, NULL, NULL, 2.0, 'AAB', 35, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Universität Erlangen-Nürnberg';
