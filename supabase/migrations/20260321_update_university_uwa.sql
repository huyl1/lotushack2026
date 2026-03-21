UPDATE public.universities
SET
  website_url = 'https://www.uwa.edu.au/study/how-to-apply/international-applicants',
  tuition_usd = 32300,
  overall_acceptance_rate = '38%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Sem 1: Jan 12; Sem 2: Jun 8 (international)',
  financial_aid = 'Need-aware. Global Excellence Scholarship: up to AUD $48k over 4 yrs (~$8.5k USD/yr). International Student Award: AUD $5k/yr fee reduction. WA Premier''s Scholarship: one-off AUD $50k for high achievers.'
WHERE name = 'The University of Western Australia';
