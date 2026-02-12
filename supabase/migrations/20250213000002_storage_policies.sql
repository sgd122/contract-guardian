-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contracts',
  'contracts',
  false,
  20971520, -- 20MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for consent_logs
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent logs"
  ON public.consent_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create consent logs"
  ON public.consent_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Storage Policies for contracts bucket
CREATE POLICY "Users can upload own contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own contracts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'contracts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
