import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { agentService } from '../agents';
import { getClient } from '../client';
import { ApiError } from '../utils/errors';
import type { CreateAgentData, Agent } from '../agents/types';

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
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn().mockResolvedValue({ data: null, error: null }),
};

const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQueryBuilder),
    functions: {
      invoke: vi.fn(),
    },
  };

const mockAgent: Agent = {
  id: 'agent-123',
  company_id: 'company-123',
  name: 'Test Agent',
  description: 'A test agent for customer support',
  evo_instance_url: 'https://evo.example.com',
  evo_api_key: 'evo-key-123',
  status: 'active',
  settings: {
    auto_reply: true,
    business_hours: {
      enabled: true,
      timezone: 'America/Sao_Paulo',
      schedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: null,
        sunday: null,
      },
    },
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('AgentService', () => {
  beforeEach(() => {
    // Reset only the implementation, not the mock structure
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.eq.mockReturnThis();
    mockQueryBuilder.ilike.mockReturnThis();
    mockQueryBuilder.order.mockReturnThis();
    mockQueryBuilder.range.mockReturnThis();
    mockQueryBuilder.single.mockResolvedValue({ data: null, error: null });
    mockQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockQueryBuilder.then.mockResolvedValue({ data: null, error: null });
    // Don't reset mockSupabase.from here as tests override it
    mockGetClient.mockReturnValue(mockSupabase as any);
  });

  describe('create', () => {
    it('should create an agent successfully', async () => {
      const createData: CreateAgentData = {
        company_id: 'company-123',
        name: 'Test Agent',
        description: 'A test agent for customer support',
        evo_instance_url: 'https://evo.example.com',
        evo_api_key: 'evo-key-123',
        settings: {
          auto_reply: true,
          business_hours: {
            enabled: true,
            timezone: 'America/Sao_Paulo',
            schedule: {
              monday: { start: '09:00', end: '18:00' },
              tuesday: { start: '09:00', end: '18:00' },
              wednesday: { start: '09:00', end: '18:00' },
              thursday: { start: '09:00', end: '18:00' },
              friday: { start: '09:00', end: '18:00' },
              saturday: null,
              sunday: null,
            },
          },
        },
      };

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockAgent,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: mockAgent,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.create(createData);

      expect(result).toEqual(mockAgent);
    });

    it('should handle creation errors', async () => {
      const createData: CreateAgentData = {
        company_id: 'invalid-company',
        name: 'Test Agent',
        description: 'A test agent',
        evo_instance_url: 'https://evo.example.com',
        evo_api_key: 'evo-key-123',
      };

      // Create a mock query that resolves with error
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { message: 'Invalid company_id' }
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: { message: 'Invalid company_id' }
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      await expect(agentService.create(createData)).rejects.toThrow(ApiError);
    });
  });

  describe('getById', () => {
    it('should get agent by id successfully', async () => {
      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockAgent,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: mockAgent,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.getById('agent-123');

      expect(result).toEqual(mockAgent);
    });

    it('should handle agent not found', async () => {
      // Create a mock query that resolves with error
      const mockQueryResult = Promise.resolve({
        data: null,
        error: { code: 'PGRST116' }
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

      await expect(agentService.getById('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list agents with pagination', async () => {
      const mockAgents = [mockAgent];
      const mockCount = 1;

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockAgents,
        error: null,
        count: mockCount
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: mockQueryResult.then.bind(mockQueryResult),
        data: mockAgents,
        error: null,
        count: mockCount
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.getAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockAgents);
      expect(result.total).toBe(mockCount);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply search filter', async () => {
      const mockAgents = [mockAgent];
      const mockCount = 1;

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockAgents,
        error: null,
        count: mockCount
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: mockQueryResult.then.bind(mockQueryResult),
        data: mockAgents,
        error: null,
        count: mockCount
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.getAll({
        page: 1,
        limit: 10,
        search: 'Test',
      });

      expect(result.data).toEqual(mockAgents);
      expect(result.total).toBe(mockCount);
      expect(chainedQuery.ilike).toHaveBeenCalledWith('name', '%Test%');
    });
  });

  describe('update', () => {
    it('should update agent successfully', async () => {
      const updateData = {
        name: 'Updated Agent',
        description: 'Updated description',
      };

      const updatedAgent = { ...mockAgent, ...updateData };

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: updatedAgent,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: updatedAgent,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.update('agent-123', updateData);

      expect(result).toEqual(updatedAgent);
    });
  });

  describe('delete', () => {
    it('should delete agent successfully', async () => {
      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: null,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => mockQueryResult),
        data: null,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      await agentService.delete('agent-123');

      // Just verify the method completes without error
    });
  });

  describe('getByCompany', () => {
    it('should get agents by company successfully', async () => {
      const mockAgents = [mockAgent];
      const mockAssignments = [{ agent: mockAgent }];

      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: mockAssignments,
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: mockQueryResult.then.bind(mockQueryResult),
        data: mockAssignments,
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.getByCompany('company-123');

      expect(result).toEqual(mockAgents);
    });
  });





  describe('testConnection', () => {
    it('should test agent connection successfully', async () => {
      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: { ...mockAgent, status: 'active' },
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: { ...mockAgent, status: 'active' },
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.testConnection('agent-123');

      expect(result).toBe(true);
    });

    it('should handle connection test failures', async () => {
      // Create a mock query that resolves immediately
      const mockQueryResult = Promise.resolve({
        data: { ...mockAgent, status: 'inactive' },
        error: null
      });
      
      // Mock the query builder chain
      const chainedQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => mockQueryResult),
        data: { ...mockAgent, status: 'inactive' },
        error: null
      };
      
      mockSupabase.from.mockReturnValue(chainedQuery);

      const result = await agentService.testConnection('agent-123');

      expect(result).toBe(false);
    });
  });
});