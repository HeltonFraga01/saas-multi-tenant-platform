import type { Database } from '../types/database';

export type AgentStatus = Database['public']['Enums']['agent_status'];
export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];
export type AgentAssignment = Database['public']['Tables']['agent_assignments']['Row'];

export interface CreateAgentData {
  name: string;
  description?: string;
  evo_agent_id: string;
  evo_instance_url: string;
  webhook_url?: string;
  config?: Record<string, any>;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  evo_agent_id?: string;
  evo_instance_url?: string;
  webhook_url?: string;
  config?: Record<string, any>;
  status?: AgentStatus;
}

export interface AssignAgentData {
  agent_id: string;
  company_id: string;
  assigned_by: string;
  notes?: string;
}

export interface AgentWithAssignments extends Agent {
  assignments?: AgentAssignment[];
  assigned_companies?: {
    id: string;
    name: string;
    status: string;
  }[];
}

export interface AgentStats {
  total_messages: number;
  active_sessions: number;
  last_activity?: string;
  uptime_percentage: number;
  response_time_avg: number;
}

export interface AgentConfig {
  auto_reply: boolean;
  welcome_message?: string;
  business_hours?: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: {
        start: string;
        end: string;
        enabled: boolean;
      };
    };
  };
  fallback_message?: string;
  max_session_duration?: number;
  rate_limit?: {
    messages_per_minute: number;
    messages_per_hour: number;
  };
}