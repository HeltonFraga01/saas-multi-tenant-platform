import { Database } from '../types/database';

export type CompanyStatus = Database['public']['Enums']['company_status'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export interface CreateCompanyData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status?: CompanyStatus;
}

export interface CompanyWithStats extends Company {
  user_count?: number;
  active_agents?: number;
  total_payments?: number;
  last_activity?: string;
}