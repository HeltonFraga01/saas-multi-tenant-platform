// Cliente Supabase
export { supabase } from './client';

// Tipos TypeScript
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json
} from './types';

// Tipos específicos das tabelas principais
export type {
  Database
} from './types';

// Aliases para facilitar o uso
export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Plan = Database['public']['Tables']['plans']['Row'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type PlanUpdate = Database['public']['Tables']['plans']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];

export type AgentAssignment = Database['public']['Tables']['agent_assignments']['Row'];
export type AgentAssignmentInsert = Database['public']['Tables']['agent_assignments']['Insert'];
export type AgentAssignmentUpdate = Database['public']['Tables']['agent_assignments']['Update'];

export type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
export type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert'];
export type ChatSessionUpdate = Database['public']['Tables']['chat_sessions']['Update'];

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update'];

export type Affiliate = Database['public']['Tables']['affiliates']['Row'];
export type AffiliateInsert = Database['public']['Tables']['affiliates']['Insert'];
export type AffiliateUpdate = Database['public']['Tables']['affiliates']['Update'];

export type Commission = Database['public']['Tables']['commissions']['Row'];
export type CommissionInsert = Database['public']['Tables']['commissions']['Insert'];
export type CommissionUpdate = Database['public']['Tables']['commissions']['Update'];

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
export type FeatureFlagInsert = Database['public']['Tables']['feature_flags']['Insert'];
export type FeatureFlagUpdate = Database['public']['Tables']['feature_flags']['Update'];

export type CompanyFeatureFlag = Database['public']['Tables']['company_feature_flags']['Row'];
export type CompanyFeatureFlagInsert = Database['public']['Tables']['company_feature_flags']['Insert'];
export type CompanyFeatureFlagUpdate = Database['public']['Tables']['company_feature_flags']['Update'];

// Enums
export type UserRole = Database['public']['Enums']['user_role'];
export type PlanType = Database['public']['Enums']['plan_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type AgentStatus = Database['public']['Enums']['agent_status'];

// Funções de teste
export {
  testConnection,
  listPlans,
  listCompanies,
  testInsert,
  runBasicTests
} from './test-connection';