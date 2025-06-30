// Client initialization
// Supabase - Database & Auth (BÁSICO PRIMEIRO)
export * from './supabase';

// Legacy exports (serão migrados gradualmente)
export { createClient, getClient } from './client';

// Authentication
export { authService } from './auth';
export type { AuthUser, LoginCredentials, RegisterData } from './auth/types';

// Companies
export { companyService } from './companies';
export type { Company, CreateCompanyData, UpdateCompanyData } from './companies/types';

// Users
export { userService } from './users';
export type { User, CreateUserData, UpdateUserData, UserRole } from './users/types';

// Plans
export { planService } from './plans';
export type { Plan, CreatePlanData, UpdatePlanData } from './plans/types';

// Payments
export { paymentService } from './payments';
export type { Payment, PaymentStatus, CreatePaymentData } from './payments/types';

// Agents
export { agentService } from './agents';
export type { Agent, CreateAgentData, UpdateAgentData } from './agents/types';

// Chat
export { chatService } from './chat';
export type { ChatSession, ChatMessage, SendMessageData } from './chat/types';

// Stores (Zustand)
export { useAuthStore } from './stores';
// TODO: Implement additional stores in Phase 3
// export { useCompanyStore } from './stores';
// export { useUserStore } from './stores';

// Utilities
export { ApiError, handleApiError } from './utils/errors';
export { validateEnv } from './utils/env';

// Types
export type { ApiResponse, PaginatedResponse, QueryParams } from './types/api';
export type { Database } from './types/database';

// Versão do pacote
export const LIB_API_VERSION = '1.0.0';

// Constantes do sistema (BÁSICO PRIMEIRO)
export const CONSTANTS = {
  ROLES: {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    USER: 'user'
  } as const,
  
  PLAN_TYPES: {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
  } as const,
  
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  } as const,
  
  AGENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance'
  } as const,
  
  PAYMENT_PROVIDERS: {
    OPENPIX: 'openpix',
    ASAAS: 'asaas'
  } as const
} as const;

// Utilitários básicos
export const utils = {
  /**
   * Valida se uma string é um UUID válido
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Gera um slug a partir de um texto
   */
  generateSlug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-'); // Remove hífens duplicados
  },

  /**
   * Formata valor monetário para exibição
   */
  formatCurrency: (value: number, currency = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency
    }).format(value);
  },

  /**
   * Valida email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};