import type { AnalysisStatus } from './analysis';
import type { Payment } from './payment';

// Upload
// Request: multipart/form-data with file field (no typed body)
export interface UploadResponse {
  analysisId: string;
  filename: string;
  pageCount: number;
  isScanned: boolean;
}

// Analyze
export interface AnalyzeRequest {
  analysisId: string;
}

export interface AnalyzeResponse {
  analysisId: string;
  status: AnalysisStatus;
}

// Payment
export interface PaymentCreateRequest {
  analysisId: string;
  amount: number;
}

export interface PaymentCreateResponse {
  orderId: string;
  amount: number;
  orderName: string;
}

export interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface PaymentConfirmResponse {
  success: boolean;
  payment: Payment;
}

// Consent
export interface ConsentRequest {
  analysisId: string;
  consentType: 'ai_disclaimer' | 'privacy_policy';
  consentVersion: string;
}

// Error
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
