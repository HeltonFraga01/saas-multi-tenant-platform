import { getClient } from '../client';
import { handleApiError } from '../utils/errors';
import type {
  Plan,
  CreatePlanData,
  UpdatePlanData,
  PlanComparison,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * Plan service
 */
class PlanService {
  /**
   * Get plan by ID
   */
  async getById(id: string): Promise<Plan> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('plans')
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
   * Get all active plans
   */
  async getActive(): Promise<Plan[]> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get plans with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Plan>> {
    try {
      const supabase = getClient();
      let query = supabase.from('plans').select('*', { count: 'exact' });

      // Apply filters
      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.billing_cycle) {
        query = query.eq('billing_cycle', params.billing_cycle);
      }

      // Apply sorting
      const orderBy = params?.sort_by || 'price';
      const order = params?.order || 'asc';
      query = query.order(orderBy, { ascending: order === 'asc' });

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: plans, error, count } = await query;

      if (error) throw error;

      return {
        data: plans || [],
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
   * Create new plan
   */
  async create(data: CreatePlanData): Promise<Plan> {
    try {
      const supabase = getClient();
      const { data: plan, error } = await supabase
        .from('plans')
        .insert({
          ...data,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return plan;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update plan
   */
  async update(id: string, data: UpdatePlanData): Promise<Plan> {
    try {
      const supabase = getClient();
      const { data: plan, error } = await supabase
        .from('plans')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return plan;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete plan (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('plans')
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
   * Get plans for comparison
   */
  async getForComparison(): Promise<PlanComparison[]> {
    try {
      const plans = await this.getActive();
      
      return plans.map(plan => ({
        plan,
        features: this.extractFeatures(plan),
        recommended: (plan as any).is_popular || false,
      }));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get plan by billing cycle
   */
  async getByBillingCycle(cycle: 'monthly' | 'yearly'): Promise<Plan[]> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('status', 'active')
        .eq('billing_cycle', cycle)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Extract features from plan
   */
  private extractFeatures(plan: Plan) {
    const features = plan.features || [];
    
    return [
      {
        id: 'users',
        name: 'Usuários',
        description: 'Número máximo de usuários',
        included: true,
        limit: plan.max_users,
      },
      {
        id: 'agents',
        name: 'Agentes IA',
        description: 'Número máximo de agentes',
        included: true,
        limit: plan.max_agents,
      },
      {
        id: 'messages',
        name: 'Mensagens',
        description: 'Mensagens por mês',
        included: true,
        limit: (plan as any).max_messages || 1000,
      },
      ...features.map((feature, index) => ({
        id: `feature_${index}`,
        name: feature,
        description: '',
        included: true,
      })),
    ];
  }
}

export const planService = new PlanService();