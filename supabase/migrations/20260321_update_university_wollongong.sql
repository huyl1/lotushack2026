UPDATE public.universities
SET
  website_url = 'https://www.uow.edu.au',
  tuition_usd = 22000,
  overall_acceptance_rate = '75%',
  test_policy = 'Not applicable',
  deadline_calendar = 'Semester 1 (Feb): apply by November 30; Semester 2 (Jul): apply by May 31',
  financial_aid = 'UOW Principal Scholars Program (up to 25% tuition reduction); UOW International Merit Scholarship; IPRS for research degrees'
WHERE name = 'University of Wollongong';
