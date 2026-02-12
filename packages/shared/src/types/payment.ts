export type PaymentStatus =
  | 'ready'
  | 'in_progress'
  | 'done'
  | 'canceled'
  | 'failed'
  | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  analysis_id: string;
  order_id: string;
  payment_key?: string;
  amount: number;
  status: PaymentStatus;
  method?: string;
  toss_response?: Record<string, unknown>;
  approved_at?: string;
  created_at: string;
}
