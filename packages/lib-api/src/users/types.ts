import { Database } from '../types/database';

export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface CreateUserData {
  email: string;
  name: string;
  role?: UserRole;
  company_id: string;
  phone?: string;
  avatar_url?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserWithCompany extends User {
  company?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  company_id: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}