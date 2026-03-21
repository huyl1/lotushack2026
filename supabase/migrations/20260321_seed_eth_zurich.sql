-- Part 1: Update university-level data for ETH Zurich
UPDATE public.universities SET
  website_url = 'https://ethz.ch/en.html',
  tuition_usd = 4949,
  overall_acceptance_rate = '~27%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Bachelor''s (non-Swiss, no entrance exam): Dec 1 – Mar 31. Bachelor''s (with entrance exam): Dec 1 – Mar 31 (exam held Jan 2027 for Autumn 2027 start). Master''s (international): Nov 1 – Nov 30. Master''s (Swiss Bachelor''s): Apr 1 – Apr 30. German C1 certificate due by Mar 31.',
  financial_aid = 'Low tuition: CHF 730/semester (Swiss/Group 1) or CHF 2,190/semester (international/Group 2, from Autumn 2025). Excellence Scholarship & Opportunity Programme (ESOP) for Master''s: CHF 12,000/semester + tuition waiver (~60 awards/year). Need-based grants via Financial Aid Office. Living costs in Zurich ~CHF 22,000–28,000/year.'
WHERE name = 'ETH Zurich (Swiss Federal Institute of Technology)';

-- Part 2: Delete existing majors
DELETE FROM public.majors
WHERE university_id = (
  SELECT id FROM public.universities
  WHERE name = 'ETH Zurich (Swiss Federal Institute of Technology)'
);

-- Part 3: Insert top 10 majors
INSERT INTO public.majors (
  id, university_id, major_name, acceptance_rate,
  supplemental_requirements, subject_ranking,
  ib_min, sat_min, act_min, atar_min
)
SELECT
  gen_random_uuid(),
  u.id,
  v.major_name,
  v.acceptance_rate,
  v.supplemental_requirements,
  v.subject_ranking,
  v.ib_min,
  NULL,
  NULL,
  NULL
FROM public.universities u
CROSS JOIN (VALUES
  (
    'Mechanical Engineering',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    14,
    38
  ),
  (
    'Computer Science',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    9,
    38
  ),
  (
    'Architecture',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics required. Portfolio not required for admission but design aptitude assessed in first year.',
    4,
    38
  ),
  (
    'Physics',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and HL Physics required.',
    9,
    38
  ),
  (
    'Electrical Engineering and Information Technology',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    11,
    38
  ),
  (
    'Civil Engineering',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    2,
    38
  ),
  (
    'Mathematics',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics required.',
    11,
    38
  ),
  (
    'Biology',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, chemistry, and biology. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and HL Biology required.',
    30,
    38
  ),
  (
    'Environmental Sciences',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, and chemistry. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    12,
    38
  ),
  (
    'Health Sciences and Technology',
    '25-30%',
    'German C1 required. Non-Swiss applicants may need to pass entrance exam covering mathematics, physics, chemistry, and biology. IB Diploma: minimum 38/42 points (excluding bonus) with HL Mathematics and one HL science subject required.',
    NULL::integer,
    38
  )
) AS v(major_name, acceptance_rate, supplemental_requirements, subject_ranking, ib_min)
WHERE u.name = 'ETH Zurich (Swiss Federal Institute of Technology)';
