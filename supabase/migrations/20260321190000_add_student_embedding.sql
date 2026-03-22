-- Add student_embedding to students table
-- Dimension: 1024 (matches voyage-3 model used in the pipeline)

ALTER TABLE public.students 
ADD COLUMN student_embedding vector(1024);

-- Add an ivfflat index for cosine similarity search
-- Pattern follows university_embeddings migration
CREATE INDEX students_embedding_idx 
ON public.students 
USING ivfflat (student_embedding vector_cosine_ops) 
WITH (lists = 100);

COMMENT ON COLUMN public.students.student_embedding IS '1024-dim voyage-3 vector for semantic search and RAG.';
