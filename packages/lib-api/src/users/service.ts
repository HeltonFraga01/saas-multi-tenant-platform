import { getClient } from '../client';
import { handleApiError } from '../utils/errors';
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserWithCompany,
  UserProfile,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * User service
 */
class UserService {
  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('users')
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
   * Get user profile with company info
   */
  async getProfile(id: string): Promise<UserProfile> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        company_name: data.company?.name,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get users with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<UserWithCompany>> {
    try {
      const supabase = getClient();
      let query = supabase
        .from('users')
        .select(`
          *,
          company:companies(id, name, status)
        `, { count: 'exact' });

      // Apply filters
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.role) {
        query = query.eq('role', params.role);
      }

      if (params?.company_id) {
        query = query.eq('company_id', params.company_id);
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
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        count: count || 0,
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrev: page > 1,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      const supabase = getClient();
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          ...data,
          status: 'active',
          role: data.role || 'user',
        })
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const supabase = getClient();
      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('users')
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
   * Update user's last login
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get users by company
   */
  async getByCompany(companyId: string, params?: QueryParams): Promise<PaginatedResponse<User>> {
    try {
      const supabase = getClient();
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId);

      // Apply filters
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.role) {
        query = query.eq('role', params.role);
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
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        count: count || 0,
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const userService = new UserService();