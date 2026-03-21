-- Convert acceptance_rate column from TEXT to NUMERIC.
-- Data was pre-cleaned: all values are already pure numeric strings (e.g. "10", "17.5")
-- or NULL. Range values were replaced with their midpoint.
-- "Selective" variants were set to NULL.
ALTER TABLE public.majors
  ALTER COLUMN acceptance_rate TYPE NUMERIC
  USING acceptance_rate::NUMERIC;
