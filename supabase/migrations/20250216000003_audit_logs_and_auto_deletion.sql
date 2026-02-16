-- ============================================================
-- 1. Audit logs table (개인정보보호법 시행령 제29조 준수)
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,           -- 'file.upload' | 'file.download' | 'analysis.create' | 'analysis.delete' | 'report.download' | 'payment.confirm' | 'account.delete'
  resource_type TEXT NOT NULL,    -- 'analysis' | 'payment' | 'report' | 'account'
  resource_id TEXT,               -- ID of the accessed resource
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Additional context (non-PII)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- RLS: only admin can read audit logs (no user access)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role can insert (API routes use admin client for logging)
CREATE POLICY "Service role can manage audit logs"
  ON public.audit_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. Auto-deletion function for expired analyses (90 days)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_analyses()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  expired_record RECORD;
BEGIN
  deleted_count := 0;

  -- Find completed analyses older than 90 days
  FOR expired_record IN
    SELECT id, file_path, user_id
    FROM public.analyses
    WHERE status = 'completed'
      AND created_at < NOW() - INTERVAL '90 days'
  LOOP
    -- Log the deletion in audit_logs
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
    VALUES (
      expired_record.user_id,
      'analysis.auto_delete',
      'analysis',
      expired_record.id::text,
      jsonb_build_object('reason', '90-day retention policy', 'file_path', expired_record.file_path)
    );

    -- Delete related consent logs (optional: keep for legal defense)
    -- UPDATE public.consent_logs SET user_id = NULL WHERE analysis_id = expired_record.id;

    -- Delete the analysis record (cascade will handle related records)
    DELETE FROM public.analyses WHERE id = expired_record.id;

    deleted_count := deleted_count + 1;
  END LOOP;

  -- Note: Storage files must be cleaned up separately via application code
  -- because Supabase Storage is not accessible from SQL functions.

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Schedule daily cleanup (requires pg_cron extension)
--    Enable pg_cron in Supabase Dashboard > Database > Extensions
-- ============================================================
-- Uncomment after enabling pg_cron extension:
-- SELECT cron.schedule(
--   'cleanup-expired-analyses',
--   '0 3 * * *',  -- Run daily at 3:00 AM UTC
--   $$SELECT public.cleanup_expired_analyses()$$
-- );
