/**
 * Database schema types (será expandido na Fase 2)
 * Por enquanto, definindo estrutura básica
 */

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          website?: string;
          logo_url?: string;
          plan_id?: string;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          company_id?: string;
          role: 'superadmin' | 'admin' | 'user';
          status: 'active' | 'inactive' | 'pending';
          last_login_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price: number;
          currency: string;
          interval: 'month' | 'year';
          features: string[];
          max_users: number;
          max_agents: number;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['plans']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          company_id: string;
          plan_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'paid' | 'failed' | 'cancelled';
          payment_method: 'pix' | 'credit_card' | 'boleto';
          external_id?: string;
          paid_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description?: string;
          evo_agent_id: string;
          evo_instance_url: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      agent_assignments: {
        Row: {
          id: string;
          company_id: string;
          agent_id: string;
          assigned_at: string;
          assigned_by: string;
        };
        Insert: Omit<Database['public']['Tables']['agent_assignments']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['agent_assignments']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'superadmin' | 'admin' | 'user';
      user_status: 'active' | 'inactive' | 'pending';
      company_status: 'active' | 'inactive' | 'suspended';
      payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
      payment_method: 'pix' | 'credit_card' | 'boleto';
      plan_interval: 'month' | 'year';
      agent_status: 'active' | 'inactive';
      plan_status: 'active' | 'inactive';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}