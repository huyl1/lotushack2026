-- University of Barcelona: Part 1 — UPDATE university record
-- Spanish public university, QS #160, founded 1450, Barcelona, Catalonia, Spain
-- Tuition for non-EU international: ~EUR 2,540/year (public university price, 2024-25)
-- EUR 2,540 * 1.10 USD/EUR ≈ USD 2,794 → rounded to 2800
UPDATE public.universities
SET
  website_url            = 'https://www.ub.edu/web/ub/en/',
  tuition_usd            = 2800,
  overall_acceptance_rate = '65%',
  test_policy            = 'Not applicable',
  deadline_calendar      = 'Applications open February–July for the September intake. International non-EU students must apply through the Spanish university pre-enrolment system (preinscripció) or directly to UB for degree-specific programmes. English-taught programmes may have earlier deadlines (check individual programme pages). Academic year starts mid-September. Application fee varies by programme.',
  financial_aid          = 'Very low tuition by design (~EUR 1,120/year for EU/EEA residents; ~EUR 2,540/year for non-EU international students, 2024–25). Spanish Ministry of Education scholarships (Becas MEC) available for EU residents. UB Grants for International Students for partial fee waivers. Erasmus+ mobility grants available. External scholarships such as La Caixa Foundation fellowships recommended for non-EU students. No institutional merit aid equivalent to North American models.'
WHERE name = 'University of Barcelona';

-- Part 2 — INSERT 10 undergraduate majors (English-taught or internationally relevant programmes)
INSERT INTO public.majors (
  university_id, major_name, acceptance_rate, supplemental_requirements,
  subject_ranking, ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
SELECT
  u.id,
  v.major_name,
  v.acceptance_rate,
  v.supplemental_requirements,
  v.subject_ranking::integer,
  v.ielts_min::numeric,
  v.toefl_min::integer,
  v.sat_min::integer,
  v.act_min::integer,
  v.gpa_min::numeric,
  v.a_level_grades,
  v.ib_min::integer,
  v.atar_min::numeric,
  v.duolingo_min::integer,
  v.pte_min::integer
FROM public.universities u
CROSS JOIN (VALUES
  (
    'International Business (English)',
    '55%',
    'Taught entirely in English; motivation letter required; proof of English proficiency required; strong background in mathematics recommended; 4-year programme leading to Grau degree equivalent; application through UB Faculty of Economics and Business',
    '151', '6.5', '80', NULL, NULL, NULL, 'ABB', '30', NULL, '105', '59'
  ),
  (
    'Biomedical Sciences',
    '30%',
    'Highly competitive; taught in Catalan/Spanish with some subjects available in English; strong background in biology and chemistry required; PAU (Spanish university entrance) or equivalent accreditation required; pre-enrolment through Catalan university system (preinscripció)',
    '67', '6.5', '80', NULL, NULL, NULL, 'AAB (Biology + Chemistry required)', '32', NULL, '105', '59'
  ),
  (
    'Medicine (Medicina)',
    '8%',
    'Extremely competitive; taught in Catalan/Spanish; requires Spanish PAU or international qualification equivalence (homologación); entrance cut-off mark typically above 12.5/14; 6-year programme leading to MD equivalent; clinical placements at Hospital Clínic de Barcelona and affiliated hospitals',
    '51', NULL, NULL, NULL, NULL, NULL, 'A*A*A (Biology + Chemistry required)', '38', NULL, NULL, NULL
  ),
  (
    'Economics',
    '60%',
    'Taught primarily in Catalan/Spanish; some subjects available in English; strong mathematics background required; international students must provide credential equivalence; application through Spanish pre-enrolment system or UB direct application for non-EU students',
    '151', '6.5', '79', NULL, NULL, NULL, 'ABB (Maths required)', '29', NULL, '100', '58'
  ),
  (
    'Law (Dret)',
    '62%',
    'Taught in Catalan/Spanish; international students must provide credential equivalence; strong analytical and writing skills required; 4-year programme; Erasmus exchange opportunities widely available; application through Spanish pre-enrolment system',
    '76', '6.5', '79', NULL, NULL, NULL, 'ABB', '28', NULL, '100', '58'
  ),
  (
    'Psychology',
    '35%',
    'One of Spain''s most competitive psychology programmes; taught in Catalan/Spanish; strong academic record required; 4-year programme; research-oriented with affiliations to Institut de Neurociències; international credential equivalence required for non-EU applicants',
    '51', '6.5', '80', NULL, NULL, NULL, 'ABB (Sciences or Humanities)', '30', NULL, '100', '58'
  ),
  (
    'Chemistry',
    '70%',
    'Taught in Catalan/Spanish; strong background in mathematics, physics and chemistry required; access to well-equipped laboratories; part of the UB Faculty of Chemistry; Erasmus+ exchange widely available; international credential equivalence required',
    '101', '6.5', '79', NULL, NULL, NULL, 'ABB (Chemistry + Maths required)', '28', NULL, '100', '55'
  ),
  (
    'Computer Engineering (Enginyeria Informàtica)',
    '65%',
    'Taught in Catalan/Spanish; strong mathematics and problem-solving background required; 4-year degree; internship opportunities with Barcelona tech sector; international credential equivalence required for non-EU applicants; some electives available in English',
    '201', '6.5', '79', NULL, NULL, NULL, 'ABB (Maths required)', '28', NULL, '100', '55'
  ),
  (
    'History of Art',
    '75%',
    'Taught in Catalan/Spanish; culturally enriching programme in one of Europe''s most artistic cities; 4-year programme; access to major Barcelona museums and cultural institutions; strong portfolio or humanities background recommended; Erasmus+ widely available',
    NULL, '6.5', '79', NULL, NULL, NULL, 'ABB (Humanities)', '27', NULL, '95', '55'
  ),
  (
    'Environmental Sciences',
    '68%',
    'Interdisciplinary programme taught in Catalan/Spanish; covers ecology, sustainability, and environmental management; fieldwork in Catalonia and Mediterranean region; 4-year degree; some English-medium electives available; international credential equivalence required for non-EU applicants',
    '201', '6.5', '79', NULL, NULL, NULL, 'ABB (Sciences)', '28', NULL, '100', '55'
  )
) AS v(
  major_name, acceptance_rate, supplemental_requirements, subject_ranking,
  ielts_min, toefl_min, sat_min, act_min, gpa_min,
  a_level_grades, ib_min, atar_min, duolingo_min, pte_min
)
WHERE u.name = 'University of Barcelona';
