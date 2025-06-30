// Client initialization
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