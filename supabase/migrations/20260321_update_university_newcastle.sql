UPDATE public.universities
SET
  website_url = 'https://www.newcastle.edu.au/study/international/fees-and-scholarships/tuition-fees',
  tuition_usd = 22000,
  overall_acceptance_rate = '~75%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Sem 1 (Feb): Nov 30 (international); Sem 2 (Jul): May 31 (international)',
  financial_aid = 'Need-aware. Vice-Chancellor''s Global Leaders Scholarship: AUD $10,000/yr (up to 4 yrs) for high-achieving international students. International Academic Excellence Scholarship: AUD $5,000 one-off for students with outstanding academic results. Various faculty-specific scholarships available.'
WHERE name = 'The University of Newcastle';
