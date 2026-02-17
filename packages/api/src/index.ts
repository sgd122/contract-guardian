// Client
export { createApiClient } from './client';
export type { ApiClient, ApiClientConfig } from './client';

// Supabase
export { getSupabaseConfig } from './supabase/config';
export type { SupabaseConfig } from './supabase/config';
export { signInWithOAuth, signOut, getSession, onAuthStateChange } from './supabase/auth';
export { uploadFile, deleteFile } from './supabase/storage';

// Services
export { createAnalysisService } from './services/analysis';
export { createPaymentService } from './services/payment';
export { createUploadService } from './services/upload';
export { createReportService } from './services/report';

// Query Keys (for cache invalidation in feature hooks)
export { queryKeys } from './query-keys';

// Hooks
export { useAuth, getBrowserClient } from './hooks/use-auth';
export { useAnalyses, useAnalysis } from './hooks/use-analyses';
export { usePayment } from './hooks/use-payment';
