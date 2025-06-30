import { getClient } from '../client';
import { handleApiError } from '../utils/errors';
import type {
  Payment,
  CreatePaymentData,
  PaymentIntent,
  PaymentSummary,
  CreatePixPaymentData,
  CreateCreditCardPaymentData,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * Payment service
 */
export class PaymentService {
  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<Payment | null> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      // Handle "not found" case specifically
      if (error && error.code === 'PGRST116') {
        return null;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get payments with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Payment>> {
    try {
      const supabase = getClient();
      let query = supabase.from('payments').select('*', { count: 'exact' });

      // Apply filters
      if (params?.company_id) {
        query = query.eq('company_id', params.company_id);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.method) {
        query = query.eq('method', params.method);
      }

      if (params?.date_from) {
        query = query.gte('created_at', params.date_from);
      }

      if (params?.date_to) {
        query = query.lte('created_at', params.date_to);
      }

      // Apply sorting
      const orderBy = params?.sort_by || 'created_at';
      const order = params?.order || 'desc';
      query = query.order(orderBy, { ascending: order === 'asc' });

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrev: page > 1,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new payment
   */
  async create(data: CreatePaymentData): Promise<Payment> {
    try {
      const supabase = getClient();
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          ...data,
          status: 'pending',
          currency: data.currency || 'BRL',
        })
        .select()
        .single();

      if (error) throw error;
      return payment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(id: string, status: string, metadata?: Record<string, any>): Promise<Payment> {
    try {
      const supabase = getClient();
      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status,
          metadata: metadata || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return payment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create PIX payment intent
   */
  async createPixPayment(data: CreatePixPaymentData): Promise<PaymentIntent> {
    try {
      // Create payment record
      const payment = await this.create({
        company_id: data.company_id,
        plan_id: data.plan_id,
        amount: data.amount,
        method: 'pix',
        description: data.description || '',
        metadata: { customer: data.customer },
      });

      // TODO: Integrate with OpenPIX API in Phase 9
      // For now, return mock data
      return {
        id: payment.id,
        amount: data.amount,
        currency: 'BRL',
        status: 'pending',
        payment_url: `https://openpix.com.br/pay/${payment.id}`,
        qr_code: `data:image/png;base64,mock-qr-code-${payment.id}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create credit card payment intent
   */
  async createCreditCardPayment(data: CreateCreditCardPaymentData): Promise<PaymentIntent> {
    try {
      // Create payment record
      const payment = await this.create({
        company_id: data.company_id,
        plan_id: data.plan_id,
        amount: data.amount,
        method: 'credit_card',
        description: data.description || '',
        metadata: { 
          customer: data.customer,
          billing_address: data.billing_address,
        },
      });

      // TODO: Integrate with Asaas API in Phase 9
      // For now, return mock data
      return {
        id: payment.id,
        amount: data.amount,
        currency: 'BRL',
        status: 'pending',
        client_secret: `cs_mock_${payment.id}`,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get payment summary for company
   */
  async getSummary(companyId: string, periodStart: string, periodEnd: string): Promise<PaymentSummary> {
    try {
      const supabase = getClient();
      
      // Get all payments in period
      const { data: payments, error } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('company_id', companyId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      if (error) throw error;

      const summary = payments?.reduce(
        (acc: any, payment: any) => {
          acc.total_amount += payment.amount || 0;
          acc.total_count += 1;

          if (payment.status === 'completed') {
            acc.completed_amount += payment.amount || 0;
            acc.completed_count += 1;
          } else if (payment.status === 'pending') {
            acc.pending_amount += payment.amount || 0;
            acc.pending_count += 1;
          } else if (payment.status === 'failed') {
            acc.failed_count += 1;
          }

          return acc;
        },
        {
          total_amount: 0,
          total_count: 0,
          completed_amount: 0,
          completed_count: 0,
          pending_amount: 0,
          pending_count: 0,
          failed_count: 0,
          period_start: periodStart,
          period_end: periodEnd,
        }
      ) || {
        total_amount: 0,
        total_count: 0,
        completed_amount: 0,
        completed_count: 0,
        pending_amount: 0,
        pending_count: 0,
        failed_count: 0,
        period_start: periodStart,
        period_end: periodEnd,
      };

      return summary;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get payments by company
   */
  async getByCompany(companyId: string, params?: QueryParams): Promise<PaginatedResponse<Payment>> {
    return this.getAll({ ...params, company_id: companyId });
  }

  /**
   * Cancel payment
   */
  async cancel(id: string): Promise<Payment> {
    return this.updateStatus(id, 'cancelled');
  }

  /**
   * Refund payment
   */
  async refund(id: string, amount?: number): Promise<Payment> {
    try {
      // TODO: Implement actual refund logic with payment providers in Phase 9
      return this.updateStatus(id, 'refunded', { refund_amount: amount });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Process webhook from payment providers
   */
  async processWebhook(provider: string, data: any): Promise<{ success: boolean }> {
    try {
      const supabase = getClient();
      const { data: result, error } = await supabase.functions.invoke('payment-webhook', {
        body: {
          provider,
          data,
        },
      });

      if (error) throw error;
      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const paymentService = new PaymentService();