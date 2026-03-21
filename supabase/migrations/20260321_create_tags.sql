CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emoji TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.student_tags (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, tag_id)
);

CREATE TABLE public.university_tags (
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (university_id, tag_id)
);

REVOKE ALL ON public.tags FROM anon;
REVOKE ALL ON public.student_tags FROM anon;
REVOKE ALL ON public.university_tags FROM anon;
