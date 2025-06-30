import { getClient } from '../client';
import { handleApiError } from '../utils/errors';
import type {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyWithStats,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * Company service
 */
class CompanyService {
  /**
   * Get company by ID
   */
  async getById(id: string): Promise<Company> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('companies')
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
   * Get companies with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Company>> {
    try {
      const supabase = getClient();
      let query = supabase.from('companies').select('*', { count: 'exact' });

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
   * Create new company
   */
  async create(data: CreateCompanyData): Promise<Company> {
    try {
      const supabase = getClient();
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          ...data,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return company;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update company
   */
  async update(id: string, data: UpdateCompanyData): Promise<Company> {
    try {
      const supabase = getClient();
      const { data: company, error } = await supabase
        .from('companies')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return company;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete company (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('companies')
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
   * Get company with statistics
   */
  async getWithStats(id: string): Promise<CompanyWithStats> {
    try {
      const supabase = getClient();
      
      // Get company data
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (companyError) throw companyError;

      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', id)
        .eq('status', 'active');

      if (userError) throw userError;

      // Get active agents count
      const { count: agentCount, error: agentError } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', id)
        .eq('status', 'active');

      if (agentError) throw agentError;

      // Get total payments
      const { data: payments, error: paymentError } = await supabase
        .from('payments')
        .select('amount')
        .eq('company_id', id)
        .eq('status', 'completed');

      if (paymentError) throw paymentError;

      const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        ...company,
        user_count: userCount || 0,
        active_agents: agentCount || 0,
        total_payments: totalPayments,
        last_activity: new Date().toISOString(), // TODO: Calculate real last activity
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const companyService = new CompanyService();