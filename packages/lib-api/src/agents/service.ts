import { getClient } from '../client';
import { handleApiError } from '../utils/errors';
import type {
  Agent,
  CreateAgentData,
  UpdateAgentData,
  AssignAgentData,
  AgentWithAssignments,
  AgentStats,
  AgentAssignment,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * Agent service
 */
class AgentService {
  /**
   * Get agent by ID
   */
  async getById(id: string): Promise<Agent> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get agent with assignments
   */
  async getWithAssignments(id: string): Promise<AgentWithAssignments> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          assignments:agent_assignments(*,
            company:companies(id, name, status)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        assigned_companies: data.assignments?.map((assignment: any) => assignment.company) || [],
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get agents with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Agent>> {
    try {
      const supabase = getClient();
      let query = supabase.from('agents').select('*', { count: 'exact' });

      // Apply filters
      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
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
   * Create new agent
   */
  async create(data: CreateAgentData): Promise<Agent> {
    try {
      const supabase = getClient();
      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          ...data,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update agent
   */
  async update(id: string, data: UpdateAgentData): Promise<Agent> {
    try {
      const supabase = getClient();
      const { data: agent, error } = await supabase
        .from('agents')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete agent (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('agents')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Assign agent to company
   */
  async assignToCompany(data: AssignAgentData): Promise<AgentAssignment> {
    try {
      const supabase = getClient();
      const { data: assignment, error } = await supabase
        .from('agent_assignments')
        .insert({
          ...data,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return assignment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Unassign agent from company
   */
  async unassignFromCompany(agentId: string, companyId: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('agent_assignments')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('agent_id', agentId)
        .eq('company_id', companyId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get agents assigned to company
   */
  async getByCompany(companyId: string): Promise<Agent[]> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('agent_assignments')
        .select(`
          agent:agents(*)
        `)
        .eq('company_id', companyId)
        .eq('status', 'active');

      if (error) throw error;
      return data?.map((assignment: any) => assignment.agent) || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get available agents (not assigned to any company)
   */
  async getAvailable(): Promise<Agent[]> {
    try {
      const supabase = getClient();
      
      // Get all active agents
      const { data: allAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active');

      if (agentsError) throw agentsError;

      // Get assigned agent IDs
      const { data: assignments, error: assignmentsError } = await supabase
        .from('agent_assignments')
        .select('agent_id')
        .eq('status', 'active');

      if (assignmentsError) throw assignmentsError;

      const assignedIds = new Set(assignments?.map((a: any) => a.agent_id) || []);
      
      return allAgents?.filter((agent: any) => !assignedIds.has(agent.id)) || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get agent statistics
   */
  async getStats(_id: string): Promise<AgentStats> {
    try {
      // TODO: Implement real statistics in Phase 10
      // For now, return mock data
      return {
        total_messages: 0,
        active_sessions: 0,
        last_activity: new Date().toISOString(),
        uptime_percentage: 99.9,
        response_time_avg: 1.2,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Test agent connection
   */
  async testConnection(id: string): Promise<boolean> {
    try {
      const agent = await this.getById(id);
      
      // TODO: Implement real connection test with Evo AI in Phase 10
      // For now, return true if agent exists and is active
      return agent.status === 'active';
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update agent configuration
   */
  async updateConfig(id: string, config: Record<string, any>): Promise<Agent> {
    return this.update(id, { config });
  }
}

export const agentService = new AgentService();