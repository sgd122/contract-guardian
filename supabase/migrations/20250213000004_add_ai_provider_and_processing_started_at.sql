-- Add ai_provider and processing_started_at columns to analyses table
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS ai_provider TEXT;
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
