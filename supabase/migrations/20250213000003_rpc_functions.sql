-- RPC function to atomically decrement free analyses remaining
CREATE OR REPLACE FUNCTION decrement_free_analyses(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET free_analyses_remaining = GREATEST(free_analyses_remaining - 1, 0)
  WHERE id = uid
    AND free_analyses_remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
