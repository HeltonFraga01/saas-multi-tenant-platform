import { Database } from '../types/database';

export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export interface CreatePaymentData {
  company_id: string;
  plan_id: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  payment_url?: string;
  qr_code?: string;
  expires_at?: string;
}

export interface PaymentWebhookData {
  event_type: string;
  payment_id: string;
  status: PaymentStatus;
  amount?: number;
  metadata?: Record<string, any>;
  provider_data?: Record<string, any>;
}

export interface PaymentProvider {
  name: 'openpix' | 'asaas';
  enabled: boolean;
  config: Record<string, any>;
}

export interface PaymentSummary {
  total_amount: number;
  total_count: number;
  completed_amount: number;
  completed_count: number;
  pending_amount: number;
  pending_count: number;
  failed_count: number;
  period_start: string;
  period_end: string;
}

export interface CreatePixPaymentData {
  company_id: string;
  plan_id: string;
  amount: number;
  description?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
}

export interface CreateCreditCardPaymentData {
  company_id: string;
  plan_id: string;
  amount: number;
  description?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document: string;
  };
  card: {
    number: string;
    holder_name: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
  };
  billing_address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
  };
}