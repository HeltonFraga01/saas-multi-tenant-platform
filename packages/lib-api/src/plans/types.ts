import { Database } from '../types/database';

export type PlanStatus = Database['public']['Enums']['plan_status'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type PlanUpdate = Database['public']['Tables']['plans']['Update'];

export interface CreatePlanData {
  name: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  max_users?: number;
  max_agents?: number;
  max_messages?: number;
  is_popular?: boolean;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  price?: number;
  billing_cycle?: 'monthly' | 'yearly';
  features?: string[];
  max_users?: number;
  max_agents?: number;
  max_messages?: number;
  is_popular?: boolean;
  status?: PlanStatus;
}

export interface PlanFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
}

export interface PlanComparison {
  plan: Plan;
  features: PlanFeature[];
  recommended?: boolean;
}

export interface PlanSubscription {
  plan_id: string;
  company_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}