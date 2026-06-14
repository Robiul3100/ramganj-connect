-- ============================================================================
-- Replace public increment_quiz_attempt RPC with auto-increment trigger
-- ============================================================================
-- Before: any client could call increment_quiz_attempt(uuid) and inflate
-- attempt counters for any quiz (RPC was SECURITY DEFINER, callable by anon).
--
-- After: attempt_count is incremented automatically by a trigger on
-- successful INSERT into quiz_attempts. The RPC is dropped so the public
-- cannot call it directly.
-- ============================================================================

DROP FUNCTION IF EXISTS public.increment_quiz_attempt(uuid);

CREATE OR REPLACE FUNCTION public.trg_increment_quiz_attempt_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quizzes
     SET attempt_count = attempt_count + 1,
         updated_at = now()
   WHERE id = NEW.quiz_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_quiz_attempt_count ON public.quiz_attempts;

CREATE TRIGGER increment_quiz_attempt_count
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION public.trg_increment_quiz_attempt_count();

COMMENT ON FUNCTION public.trg_increment_quiz_attempt_count() IS
  'Auto-increments quizzes.attempt_count on every quiz_attempts insert. Replaces public RPC.';