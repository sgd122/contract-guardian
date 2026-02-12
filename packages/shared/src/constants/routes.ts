export const API_ROUTES = {
  upload: '/api/upload',
  analyze: '/api/analyze',
  analyses: '/api/analyses',
  analysis: (id: string) => `/api/analyses/${id}` as const,
  paymentCreate: '/api/payment',
  paymentConfirm: '/api/payment/confirm',
  consent: '/api/consent',
  report: (id: string) => `/api/report/${id}` as const,
  authCallback: '/api/auth/callback',
} as const;
