ALTER TABLE public.majors
ADD COLUMN IF NOT EXISTS major_embedding vector(1024);

CREATE INDEX IF NOT EXISTS majors_embedding_idx
ON public.majors
USING ivfflat (major_embedding vector_cosine_ops)
WITH (lists = 100);

COMMENT ON COLUMN public.majors.major_embedding IS '1024-dim voyage-3 vector for major-level semantic search.';
