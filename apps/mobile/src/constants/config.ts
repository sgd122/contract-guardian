import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from '@cg/shared';

export const APP_CONFIG = {
  name: '계약서 지킴이',
  version: '1.0.0',
  scheme: 'contract-guardian',
} as const;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  supabaseUrl,
  supabaseAnonKey,
} as const;

export const FILE_CONFIG = {
  maxFileSize: MAX_FILE_SIZE,
  supportedFormats: SUPPORTED_FORMATS,
} as const;

export const FEATURE_FLAGS = {
  enableNotifications: false,
  enableCameraUpload: true,
  enableDocumentScanner: true,
} as const;
