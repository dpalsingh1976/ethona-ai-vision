
-- Migration 6: Delete duplicate calls + add unique index on retell_call_id
DELETE FROM public.calls
WHERE id NOT IN (
  SELECT DISTINCT ON (retell_call_id) id
  FROM public.calls
  WHERE retell_call_id IS NOT NULL
  ORDER BY retell_call_id, transcript_summary NULLS LAST, created_at DESC
)
AND retell_call_id IS NOT NULL;

-- Add unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_retell_call_id_unique 
ON public.calls (retell_call_id) 
WHERE retell_call_id IS NOT NULL;

-- Migration 7: Add unique constraint on retell_call_id
ALTER TABLE public.calls ADD CONSTRAINT calls_retell_call_id_unique UNIQUE (retell_call_id);
