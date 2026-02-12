export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const SUPPORTED_FORMATS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;
export const ANALYSIS_TIMEOUT = 180_000; // 3 minutes
export const MIN_TEXT_LENGTH = 100; // Below this = scanned PDF, use Vision
export const MAX_RETRIES = 2;
export const MAX_TOKENS = 16_384; // Claude max output tokens for analysis
export const MAX_PDF_PAGES = 20; // Max pages to convert for vision analysis
