-- Part 1: Update university-level data for Sorbonne University
UPDATE public.universities SET
  website_url = 'https://www.sorbonne-universite.fr/en',
  tuition_usd = 192,
  overall_acceptance_rate = '25-28%',
  test_policy = 'Not applicable',
  deadline_calendar = 'International non-EU students apply via Campus France / Etudes en France portal (Nov-Jan for Sept start). EU/EEA students apply via Parcoursup (Jan-Apr). Some programs have earlier deadlines. Medicine (PASS/L.AS) follows national Parcoursup timeline.',
  financial_aid = 'Very low tuition: €178/year for bachelor''s cycle (non-EU students benefit from partial exemption per Board of Directors decision of July 2025). Eiffel Excellence Scholarship (Master''s/PhD: monthly allowance + travel + insurance). MIEM International Mobility Master''s Scholarship. CROUS need-based grants for eligible students. Erasmus Mundus scholarships for select joint programs. Ad hoc emergency assistance available. Blocked account of ~€7,380 required for student visa.'
WHERE name = 'Sorbonne University (merged from Paris IV & UPMC)';

-- Part 2: Insert top 10 majors for Sorbonne University
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
  ('Mathematics (Licence Mathematiques)', 25.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required (DELF/DALF/TCF) as program is taught in French. Strong mathematics background essential. No SAT/ACT required.', 'QS #12 World; #1 France (Mathematics)', 6.0, 80, NULL, NULL, 3.0, 'AAA', 32, NULL, NULL, NULL),
  ('Physics (Licence Physique)', 28.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required. Strong physics and mathematics background required. Bi-disciplinary options available (e.g., Physics-Chemistry, Physics-Computer Science).', 'QS #28 World; #2 France (Physics & Astronomy)', 6.0, 80, NULL, NULL, 3.0, 'AAA', 32, NULL, NULL, NULL),
  ('Medicine (PASS - Parcours d''Acces Specifique Sante)', 12.0, 'Highly selective first-year health pathway (PASS). Apply via Parcoursup only. French C1 required. Numerus clausus applies. Biology and Chemistry background essential. Six-year program leading to national diploma.', 'QS #49 World; #1 France (Medicine)', NULL, NULL, NULL, NULL, 3.5, 'A*A*A', 36, NULL, NULL, NULL),
  ('Biology (Licence Sciences de la Vie)', 30.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required. Strong background in biology, chemistry, and mathematics expected. Multiple specialisation tracks available from L2.', 'QS #31 World; #1 France (Biological Sciences)', 6.0, 80, NULL, NULL, 3.0, 'AAB', 30, NULL, NULL, NULL),
  ('Computer Science (Licence Informatique)', 22.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required. Strong mathematics background essential. Bi-disciplinary option with Mathematics available. High demand program with competitive admission.', 'QS #76 World (Engineering & Technology); Top 100 (Computer Science)', 6.0, 80, NULL, NULL, 3.0, 'AAA', 32, NULL, NULL, NULL),
  ('Chemistry (Licence Chimie)', 30.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required. Strong chemistry and mathematics background required. Bi-disciplinary options available (e.g., Chemistry-Biology, Chemistry-Physics).', 'QS Top 100 World (Chemistry)', 6.0, 80, NULL, NULL, 3.0, 'AAB', 30, NULL, NULL, NULL),
  ('French Literature and Language (Licence Lettres)', 35.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French C1 required (strong literary French expected). Part of the Faculty of Arts and Humanities (Faculte des Lettres). Options in Classical or Modern Literature.', 'QS Top 50 World (Arts & Humanities); #2 France', 6.0, 80, NULL, NULL, 3.0, 'AAB', 30, NULL, NULL, NULL),
  ('History (Licence Histoire)', 35.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French C1 required. Faculty of Arts and Humanities. Covers ancient, medieval, modern, and contemporary history. Strong writing skills in French essential.', 'QS Top 50 World (History); #2 France', 6.0, 80, NULL, NULL, 3.0, 'AAB', 30, NULL, NULL, NULL),
  ('Earth and Marine Sciences (Licence Sciences de la Terre)', 32.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French B2-C1 required. Sorbonne hosts the European Marine Biological Resource Centre (EMBRC). Strong background in physics, chemistry, and mathematics expected.', 'QS Top 50 World (Earth & Marine Sciences); #1 France', 6.0, 80, NULL, NULL, 3.0, 'AAB', 30, NULL, NULL, NULL),
  ('Philosophy (Licence Philosophie)', 38.0, 'Apply via Parcoursup (EU) or Campus France (non-EU). French C1 required. Faculty of Arts and Humanities. Strong background in humanities and critical thinking. Knowledge of ancient languages (Latin/Greek) may be beneficial.', 'QS Top 50 World (Philosophy); #2 France', 6.0, 80, NULL, NULL, 3.0, 'ABB', 28, NULL, NULL, NULL)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Sorbonne University (merged from Paris IV & UPMC)';
