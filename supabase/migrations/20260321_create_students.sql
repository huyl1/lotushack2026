CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  dob DATE,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sat_score INTEGER,
  ielts_score NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_states ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Authenticated users can read students" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert students" ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update students" ON public.students FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read student_states" ON public.student_states FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert student_states" ON public.student_states FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update student_states" ON public.student_states FOR UPDATE TO authenticated USING (true);
