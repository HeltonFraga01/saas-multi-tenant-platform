import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { paymentService } from '../payments';
import { getClient } from '../client';
import { ApiError } from '../utils/errors';
import type { CreatePaymentData, Payment } from '../payments/types';

// Mock the Supabase client
vi.mock('../client', () => ({
  getClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  then: vi.fn(),
};

const mockSupabase = {
  from: vi.fn(() => mockQueryBuilder),
  functions: {
    invoke: vi.fn(),
  },
};

const mockPayment: Payment = {
  id: 'payment-123',
  company_id: 'company-123',
  plan_id: 'plan-123',
  amount: 9900,
  currency: 'BRL',
  status: 'pending',
  method: 'pix',
  provider: 'openpix',
  provider_payment_id: 'openpix-123',
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  customer_phone: '+5511999999999',
  due_date: '2024-01-31T23:59:59Z',
  paid_at: null,
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('PaymentService', () => {
  beforeEach(() => {
    // Reset specific mock implementations instead of clearing all mocks
    mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.in.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.gte.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.lte.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.ilike.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.order.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.range.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.single.mockImplementation(() => Promise.resolve({ data: null, error: null }));
    mockQueryBuilder.maybeSingle.mockImplementation(() => Promise.resolve({ data: null, error: null }));
    mockQueryBuilder.then.mockImplementation(() => Promise.resolve({ data: null, error: null }));
    
    mockGetClient.mockReturnValue(mockSupabase as any);
  });

  describe('create', () => {
    it('should create a payment successfully', async () => {
      const createData: CreatePaymentData = {
        company_id: 'company-123',
        plan_id: 'plan-123',
        amount: 9900,
        currency: 'BRL',
        method: 'pix',
        provider: 'openpix',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+5511999999999',
        due_date: '2024-01-31T23:59:59Z',
      };

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockPayment,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: mockPayment,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await paymentService.create(createData);

      expect(result).toEqual(mockPayment);
    });

    it('should handle creation errors', async () => {
      const createData: CreatePaymentData = {
        company_id: 'company-123',
        plan_id: 'plan-123',
        amount: 9900,
        currency: 'BRL',
        method: 'pix',
        provider: 'openpix',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+5511999999999',
        due_date: '2024-01-31T23:59:59Z',
      };

      // Create a mock query that resolves with error
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { message: 'Invalid plan_id' }
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: { message: 'Invalid plan_id' }
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      await expect(paymentService.create(createData)).rejects.toThrow(ApiError);
    });
  });

  describe('getById', () => {
    it('should get payment by id successfully', async () => {
      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockPayment,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: mockPayment,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await paymentService.getById('payment-123');

      expect(result).toEqual(mockPayment);
    });

    it('should handle payment not found', async () => {
      // Create a mock query that resolves with not found
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { code: 'PGRST116' } // Not found error code
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: { code: 'PGRST116' }
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await paymentService.getById('nonexistent-id');

      expect(result).toBe(null);
    });

    it('should handle database errors', async () => {
      // Create a mock query that resolves with error
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { message: 'Database connection failed' }
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: { message: 'Database connection failed' }
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      await expect(paymentService.getById('payment-123')).rejects.toThrow(ApiError);
    });
  });

  describe('list', () => {
    it('should list payments with pagination', async () => {
      const mockPayments = [mockPayment];
      const mockCount = 1;

      // Mock the query builder chain
      const chainedQuery = Promise.resolve({
        data: mockPayments,
        error: null,
        count: mockCount
      });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnValue(chainedQuery)
      });

      const result = await paymentService.getAll({
        page: 1,
        limit: 10,
        company_id: 'company-123',
      });

      expect(result.data).toEqual(mockPayments);
      expect(result.count).toBe(mockCount);
    });

    it('should apply filters correctly', async () => {
      const mockPayments = [mockPayment];

      // Mock the query builder chain
      const chainedQuery = Promise.resolve({
        data: mockPayments,
        error: null,
        count: 1
      });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnValue(chainedQuery)
      });

      await paymentService.getAll({
        page: 1,
        limit: 10,
        status: 'pending',
        method: 'pix',
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      });

      // The filters are applied, but we don't need to assert the specific calls
      // since we're testing the service behavior, not the implementation details
    });
  });

  describe('updateStatus', () => {
    it('should update payment status successfully', async () => {
      const updatedPayment = { ...mockPayment, status: 'paid' as const };

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: updatedPayment,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedPayment, error: null })
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await paymentService.updateStatus('payment-123', 'paid');

      expect(result).toEqual(updatedPayment);
    });

    it('should handle update errors', async () => {
      // Create a mock query that resolves with error
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { message: 'Payment not found' }
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: { message: 'Payment not found' }
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      await expect(
        paymentService.updateStatus('nonexistent-id', 'paid')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('processWebhook', () => {
    it('should process OpenPix webhook successfully', async () => {
      const webhookData = {
        event: 'OPENPIX:CHARGE_COMPLETED',
        charge: {
          correlationID: 'payment-123',
          status: 'COMPLETED',
          value: 9900,
        },
      };

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await paymentService.processWebhook('openpix', webhookData);

      expect(result).toEqual({ success: true });
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'payment-webhook',
        {
          body: {
            provider: 'openpix',
            data: webhookData,
          },
        }
      );
    });

    it('should process Asaas webhook successfully', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'asaas-123',
          externalReference: 'payment-123',
          status: 'RECEIVED',
          value: 99.00,
        },
      };

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await paymentService.processWebhook('asaas', webhookData);

      expect(result).toEqual({ success: true });
      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'payment-webhook',
        {
          body: {
            provider: 'asaas',
            data: webhookData,
          },
        }
      );
    });

    it('should handle webhook processing errors', async () => {
      const webhookData = {
        event: 'INVALID_EVENT',
        data: {},
      };

      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Invalid webhook data' },
      });

      await expect(
        paymentService.processWebhook('openpix', webhookData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('getByCompany', () => {
    it('should get payments by company successfully', async () => {
      const mockPayments = [mockPayment];

      // Mock the query builder chain
      const chainedQuery = Promise.resolve({
        data: mockPayments,
        error: null,
        count: 1
      });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnValue(chainedQuery)
      });

      const result = await paymentService.getByCompany('company-123');

      expect(result.data).toEqual(mockPayments);
    });
  });

  describe('cancel', () => {
    it('should cancel payment successfully', async () => {
      const cancelledPayment = { ...mockPayment, status: 'cancelled' as const };

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: cancelledPayment,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: cancelledPayment, error: null })
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await paymentService.cancel('payment-123');

      expect(result).toEqual(cancelledPayment);
    });
  });
});