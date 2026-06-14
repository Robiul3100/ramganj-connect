-- ============================================================================
-- Lock down quiz_attempts PII: keep public read on aggregate data only
-- ============================================================================
-- Before this migration, the policy "Public read attempts" allowed ANY user
-- (including unauthenticated) to SELECT every column from quiz_attempts,
-- including player_name and player_phone. That is a PII leak.
--
-- Fix:
--   1. Drop the public-SELECT policy.
--   2. Create a public-safe VIEW exposing only non-PII fields.
--   3. Re-grant public SELECT on the view (not the underlying table).
--   4. Keep "Anyone can submit attempt" INSERT policy (captcha-gated in app).
--   5. Keep admin manage attempts policy.
-- ============================================================================

DROP POLICY IF EXISTS "Public read attempts" ON public.quiz_attempts;

CREATE OR REPLACE VIEW public.public_quiz_leaderboard AS
SELECT
  id,
  quiz_id,
  score,
  total_questions,
  percentage,
  time_taken_seconds,
  passed,
  created_at
FROM public.quiz_attempts;

-- Public can read only the safe view
GRANT SELECT ON public.public_quiz_leaderboard TO anon, authenticated;

COMMENT ON VIEW public.public_quiz_leaderboard IS
  'Public-safe projection of quiz_attempts (no PII). Use this for leaderboards.';