-- Part 1: University-level data for Stockholm University
-- Tuition: EU/EEA/Swiss citizens pay no tuition fees (only nominal student union fee ~350 SEK/semester).
-- Non-EU/EEA students pay programme-specific fees: approx. 90,000–135,000 SEK/year.
-- Representative average for English-taught bachelor programmes: ~100,000 SEK/year ≈ $9,200 USD (at ~0.092 USD/SEK).
UPDATE public.universities SET
  website_url = 'https://www.su.se/english',
  tuition_usd = 9200,
  overall_acceptance_rate = '40-50%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Apply via University Admissions Sweden (universityadmissions.se). First round deadline: January 15 for autumn semester (September start). Second round deadline: March 15. Results released in April (first round) and May (second round). Notification of selection results via antagning.se. Late applications accepted for second round; first round strongly recommended for international applicants.',
  financial_aid = 'EU/EEA/Swiss students pay no tuition fees (only ~350 SEK/semester student union fee). Non-EU students eligible for Stockholm University Scholarship (full or partial tuition waiver, merit-based, awarded via universityadmissions.se scholarship application). Swedish Institute Scholarships (SI Study Scholarships) available for students from certain countries: full tuition + living stipend of ~11,000 SEK/month. Erasmus+ incoming exchange available for EU partner universities. Emergency student aid available through student unions (SUS/SSCO).'
WHERE name = 'Stockholm University';

-- Part 2: Top 10 undergraduate English-taught programmes at Stockholm University
-- Swedish university: SAT, ACT, ATAR not used. IB minimum reflects typical selection cut-offs.
-- Acceptance rates reflect programme-level competitiveness within Swedish admissions system.
-- IELTS 6.5 / TOEFL 90 are standard minimum requirements across all English-taught programmes.
INSERT INTO public.majors (university_id, major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
SELECT u.id, v.major_name, v.acceptance_rate, v.supplemental_requirements, v.subject_ranking, v.ielts_min, v.toefl_min, v.sat_min, v.act_min, v.gpa_min, v.a_level_grades, v.ib_min, v.atar_min, v.duolingo_min, v.pte_min
FROM public.universities u
CROSS JOIN (VALUES
  ('Bachelor''s Programme in Economics', 35.0, 'Strong mathematics background required (equivalent to Swedish Mathematics 3b/3c); admission based on upper secondary grades (Meritvärde) or Swedish Scholastic Aptitude Test (SweSAT/Högskoleprovet); no personal statement required; eligibility requires approved courses in Swedish or English upper secondary equivalent', 'QS Top 200 World (Economics & Econometrics)', 6.5, 90, NULL, NULL, 3.0, 'ABB', 30, NULL, 110, 62),
  ('Bachelor''s Programme in Computer and Systems Sciences', 40.0, 'Mathematics and natural science background recommended; admission via upper secondary GPA or SweSAT; programme offered at Kista campus; strong logical and analytical aptitude expected; no programming prerequisites required for admission', 'QS Top 300 World (Computer Science & Information Systems)', 6.5, 90, NULL, NULL, 3.0, 'BBC', 28, NULL, 110, 62),
  ('Bachelor''s Programme in Cognitive Science', 30.0, 'Interdisciplinary background spanning psychology, linguistics, computer science, and philosophy; admission via upper secondary GPA or SweSAT; mathematics background advantageous; strong analytical reasoning expected', NULL, 6.5, 90, NULL, NULL, 3.0, 'ABB', 30, NULL, 110, 62),
  ('Bachelor''s Programme in Environmental Science', 45.0, 'Natural science upper secondary background (biology, chemistry, physics, mathematics) required; admission via upper secondary GPA or SweSAT; field work and laboratory components from first year', 'QS Top 100 World (Environmental Sciences)', 6.5, 90, NULL, NULL, 3.0, 'BBC', 28, NULL, 110, 62),
  ('Bachelor''s Programme in Political Science', 35.0, 'Social science background recommended; admission via upper secondary GPA or SweSAT; no personal statement required; strong writing and analytical skills expected; course literature in English throughout', 'QS Top 200 World (Politics & International Studies)', 6.5, 90, NULL, NULL, 3.0, 'ABB', 29, NULL, 110, 62),
  ('Bachelor''s Programme in Mathematics', 50.0, 'Strong upper secondary mathematics required (equivalent to Swedish Mathematics 4 or 5); admission via GPA or SweSAT; no personal statement; rigorous proof-based curriculum from first semester', 'QS Top 200 World (Mathematics)', 6.5, 90, NULL, NULL, 3.0, 'ABB', 30, NULL, 110, 62),
  ('Bachelor''s Programme in Statistics', 45.0, 'Mathematics upper secondary background required (Mathematics 3b/3c equivalent); admission via upper secondary GPA or SweSAT; programme covers statistical theory, data analysis, and actuarial mathematics', NULL, 6.5, 90, NULL, NULL, 3.0, 'BBC', 28, NULL, 110, 62),
  ('Bachelor''s Programme in Molecular Life Science', 30.0, 'Biology and chemistry upper secondary courses required; physics and mathematics recommended; admission via upper secondary GPA or SweSAT; laboratory-intensive programme; eligibility assessed on science prerequisites', 'QS Top 200 World (Biological Sciences)', 6.5, 90, NULL, NULL, 3.0, 'ABB', 30, NULL, 110, 62),
  ('Bachelor''s Programme in Physical Geography and Quaternary Science', 55.0, 'Natural science background recommended; mathematics and geography/earth sciences advantageous; admission via upper secondary GPA or SweSAT; includes field courses in Scandinavia; combines geomorphology, climatology, and Quaternary geology', NULL, 6.5, 90, NULL, NULL, 3.0, 'BBC', 27, NULL, 110, 62),
  ('Bachelor''s Programme in Social Anthropology', 40.0, 'Social science or humanities upper secondary background; admission via upper secondary GPA or SweSAT; no personal statement required; critical thinking and cross-cultural interest expected; extensive reading course list in English', NULL, 6.5, 90, NULL, NULL, 3.0, 'BBC', 28, NULL, 110, 62)
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min, a_level_grades, ib_min, atar_min, duolingo_min, pte_min)
WHERE u.name = 'Stockholm University';
