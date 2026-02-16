-- RPC: Atomically process refund (update payment + analysis status)
CREATE OR REPLACE FUNCTION process_refund(
  p_payment_id UUID,
  p_analysis_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.payments
  SET status = 'canceled', updated_at = NOW()
  WHERE id = p_payment_id;

  UPDATE public.analyses
  SET status = 'canceled', updated_at = NOW()
  WHERE id = p_analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Atomically delete all user data (payments, analyses, profile)
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.payments WHERE user_id = p_user_id;
  DELETE FROM public.analyses WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
