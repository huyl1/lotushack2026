UPDATE public.universities
SET
  website_url = 'https://www.rmit.edu.au/study-with-us/applying-to-rmit/international-student-applications',
  tuition_usd = 24000,
  overall_acceptance_rate = '72%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Sem 1: Nov 30 (international recommended); Sem 2: May 31 (international recommended)',
  financial_aid = 'Need-aware. RMIT University Scholarship: up to AUD $10,000 per year for high-achieving international students. RMIT Excellence Scholarship covers partial tuition. Various faculty-specific scholarships available.'
WHERE name = 'RMIT University';
