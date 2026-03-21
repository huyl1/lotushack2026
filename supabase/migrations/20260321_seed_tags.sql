INSERT INTO public.tags (name, description, emoji, category) VALUES
-- Climate
('Hot Summers', 'Average summer temperature exceeds 30°C (86°F)', '☀️', 'Climate'),
('Cold Winters', 'Average winter temperature below -5°C (23°F)', '❄️', 'Climate'),
('Mild Year-Round', 'Average temperature stays between 10°C and 25°C year-round', '🌤️', 'Climate'),
('Four Seasons', 'Distinct spring, summer, fall, and winter with >15°C seasonal variation', '🍂', 'Climate'),
('Tropical', 'Average temperature above 20°C year-round with high humidity (>70%)', '🌴', 'Climate'),
('Rainy', 'Annual rainfall exceeds 1200mm (47 inches)', '🌧️', 'Climate'),
('Dry/Arid', 'Annual rainfall below 500mm (20 inches)', '🏜️', 'Climate'),
('Snowy Winters', 'Average annual snowfall exceeds 50cm (20 inches)', '🌨️', 'Climate'),

-- Location
('Downtown', 'Campus located within the central business district of a major city (pop >500k)', '🏙️', 'Location'),
('Suburban', 'Campus located in a suburb or small city (pop 50k–500k)', '🏘️', 'Location'),
('Rural', 'Campus located in an area with population under 50k', '🌾', 'Location'),
('Coastal', 'Campus within 30km of an ocean or major sea coastline', '🏖️', 'Location'),
('Mountain', 'Campus at elevation above 1000m or within 50km of a major mountain range', '🏔️', 'Location'),
('Near Major Airport', 'International airport with direct or 1-stop flights to Asia within 30km of campus', '✈️', 'Location'),

-- School Size
('Small School', 'Total undergraduate enrollment under 5,000 students', '🏫', 'School Size'),
('Medium School', 'Total undergraduate enrollment between 5,000 and 15,000 students', '🏛️', 'School Size'),
('Large School', 'Total undergraduate enrollment over 15,000 students', '🏟️', 'School Size'),

-- Demographics
('Large Asian Population', 'Exceeds 1.5x the national average for Asian students (US: >12%, UK: >18%, Canada: >35%, Australia: >25%)', '🌏', 'Demographics'),
('Large Latino Population', 'Exceeds 1.5x the national average for Hispanic/Latino students (US: >30%, Canada: >3%). Not tracked in UK/Australia', '🌎', 'Demographics'),
('Large Black Population', 'Exceeds 1.5x the national average for Black students (US: >18%, UK: >12%, Canada: >7%, Australia: >3%)', '🌍', 'Demographics'),
('Large International Population', 'Exceeds 1.5x the national average for international students (US: >10%, UK: >35%, Canada: >25%, Australia: >35%)', '✈️', 'Demographics'),
('Highly Diverse', 'No single racial/ethnic group exceeds 50% of undergraduate enrollment', '🤝', 'Demographics'),
('Predominantly White', 'White/Caucasian students make up >65% of undergraduate enrollment', '📊', 'Demographics'),
('Large Vietnamese Population', 'Exceeds 1.5x the national average for Vietnamese residents in the metro area (US: >1%, UK: >0.3%, Canada: >1.2%, Australia: >2%)', '🇻🇳', 'Demographics'),

-- Culture & Vibe
('Research-Focused', 'Classified as R1 research university or equivalent with >$100M annual research expenditure', '🔬', 'Culture & Vibe'),
('Liberal Arts', 'Core curriculum requires coursework across humanities, sciences, and social sciences with <5,000 undergrads', '📚', 'Culture & Vibe'),
('Party School', 'Ranked in top 50 party schools by national publications or >30% Greek life participation', '🎉', 'Culture & Vibe'),
('Greek Life', 'Greek organization participation rate exceeds 20% of undergraduate population', '🏛️', 'Culture & Vibe'),
('International-Friendly', 'Offers ESL support, international student office, and >10% international enrollment', '🌐', 'Culture & Vibe'),

-- Academics
('STEM-Strong', '>40% of degrees awarded are in STEM fields', '🧪', 'Academics'),
('Business-Strong', 'Business school ranked in national top 50 or >20% of degrees in business', '💼', 'Academics'),
('Arts-Strong', 'Nationally ranked programs in fine arts, music, or design', '🎨', 'Academics'),
('Pre-Med', 'Medical school acceptance rate >70% or dedicated pre-med advising program', '⚕️', 'Academics'),
('Engineering', 'ABET-accredited engineering programs with >15% of degrees in engineering', '⚙️', 'Academics'),

-- Campus Life
('Strong Athletics', 'NCAA Division I athletics program or nationally ranked sports teams', '🏅', 'Campus Life'),
('Active Clubs', 'Over 300 registered student organizations on campus', '🎭', 'Campus Life'),
('Residential Campus', '>70% of undergraduates live on campus', '🏠', 'Campus Life'),
('Commuter-Friendly', '>50% of students commute; campus near public transit', '🚇', 'Campus Life'),
('Asian Food Accessible', 'Asian grocery stores and restaurants within 10km of campus or Asian dining options on campus', '🍜', 'Campus Life'),

-- Career & Outcomes
('Strong Alumni Network', 'Active alumni association with >100k members or top-ranked alumni network', '🤝', 'Career & Outcomes'),
('High Employment Rate', '>90% of graduates employed or in grad school within 6 months', '📈', 'Career & Outcomes'),
('Co-op/Internship Programs', 'Structured co-op or mandatory internship program integrated into curriculum', '🔧', 'Career & Outcomes'),
('Near Tech Hub', 'Campus within 50km of a major tech industry cluster (e.g. Silicon Valley, Austin, Seattle)', '💻', 'Career & Outcomes'),

-- Safety & Surroundings
('Low Crime Area', 'Campus city has a violent crime rate below the national average (US: <4 per 1,000)', '🛡️', 'Safety & Surroundings'),
('Safe Campus', 'Fewer than 5 reported Clery Act crimes per 1,000 students annually', '🔐', 'Safety & Surroundings'),
('Near Nightlife', 'Campus within 15 minutes of bars, restaurants, and entertainment districts', '🌃', 'Safety & Surroundings'),
('Near Nature/Parks', 'National or state park, major hiking trail, or large green space within 30km of campus', '🌲', 'Safety & Surroundings'),

-- Language & Support
('Vietnamese-Speaking Community', 'Vietnamese population exceeds 1% of the metro area or active Vietnamese student association on campus', '🇻🇳', 'Language & Support'),
('Mandarin-Speaking Community', 'Chinese population exceeds 2% of the metro area or active Chinese student association on campus', '🇨🇳', 'Language & Support'),
('Bilingual Support', 'University offers multilingual advising, orientation, or administrative support in 2+ languages', '🗣️', 'Language & Support'),
('Strong ESL Programs', 'Dedicated English language center with conditional admission or bridge programs for non-native speakers', '📖', 'Language & Support'),

-- Housing & Living
('Low Cost of Living', 'City cost of living index below 95 (US national average = 100)', '🏷️', 'Housing & Living'),
('Affordable Housing', 'Average off-campus rent for a 1-bedroom within 5km of campus is under $1,000/month', '🏘️', 'Housing & Living'),
('On-Campus Housing Guaranteed', 'University guarantees on-campus housing for all first-year or all undergraduate students', '🛏️', 'Housing & Living'),
('Walkable Campus', 'Campus Walk Score above 70 or all major facilities within 15-minute walk', '🚶', 'Housing & Living'),

-- Religious/Spiritual
('Religious Affiliation', 'University is officially affiliated with a religious denomination or faith tradition', '⛪', 'Religious/Spiritual'),
('Secular Campus', 'University has no religious affiliation and does not require religious coursework', '🏫', 'Religious/Spiritual'),
('Active Faith Communities', 'Campus hosts 5+ active religious/spiritual student organizations', '🙏', 'Religious/Spiritual'),

-- Sports & Recreation
('Outdoor Recreation', 'Major ski resort, hiking trails, or water sports within 50km of campus', '🏕️', 'Sports & Recreation'),
('Strong Intramural Sports', 'Intramural/club sports program with 20+ sports and >25% student participation', '⚽', 'Sports & Recreation'),
('Gym/Fitness Facilities', 'Campus recreation center exceeding 50,000 sq ft or rated in national top 50', '💪', 'Sports & Recreation'),

-- Transportation
('Bike-Friendly', 'City Bike Score above 70 or dedicated campus bike infrastructure and bike-share program', '🚲', 'Transportation'),
('Good Public Transit', 'Campus served by bus, metro, or rail with service every 15 minutes or less during peak hours', '🚌', 'Transportation'),
('Car Needed', 'Limited public transit; most students require a personal vehicle for daily errands', '🚗', 'Transportation'),

-- Teaching & Learning
('Small Class Sizes', 'Average undergraduate class size below 30 students', '👩‍🏫', 'Teaching & Learning'),
('Undergraduate Research Opportunities', 'Funded undergraduate research programs or >20% of undergrads participate in faculty-led research', '🔍', 'Teaching & Learning'),
('Teaching-Focused Faculty', 'University prioritizes teaching over research with student-to-faculty ratio below 15:1', '📝', 'Teaching & Learning'),

-- Student Wellness
('Mental Health Services', 'On-campus counseling center offering free sessions to all enrolled students', '🧠', 'Student Wellness'),
('Free Healthcare/Clinic', 'On-campus health clinic providing free or low-cost primary care to enrolled students', '🏥', 'Student Wellness'),
('Multilingual Counseling', 'Counseling services available in 3+ languages or dedicated international student counselors', '💬', 'Student Wellness'),;
