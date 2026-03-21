ALTER TABLE public.student_states
ADD COLUMN student_embedding vector(1024);

ALTER TABLE public.student_states
ADD COLUMN IF NOT EXISTS left_overtime integer;

CREATE INDEX IF NOT EXISTS student_states_embedding_idx
ON public.student_states
USING ivfflat (student_embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON COLUMN public.student_states.student_embedding IS '1024-dim voyage-3 vector for student-state embeddings.';
COMMENT ON COLUMN public.student_states.left_overtime IS 'Months remaining until first college fall semester (August).';
