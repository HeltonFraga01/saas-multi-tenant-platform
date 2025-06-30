import { handleApiError } from '../utils/errors';
import type {
  ChatMessage,
  ChatSession,
  SendMessageData,
  CreateSessionData,
  ChatSessionWithMessages,
  ChatStats,
  EvoWebhookData,
  SendEvoMessageData,
  EvoInstanceConfig,
  ChatFilter,
} from './types';
import type { PaginatedResponse, QueryParams } from '../types/api';

/**
 * Chat service
 * Handles chat sessions, messages, and Evo AI integration
 */
class ChatService {
  private evoConfig: EvoInstanceConfig | null = null;

  /**
   * Set Evo AI configuration
   */
  setEvoConfig(config: EvoInstanceConfig): void {
    this.evoConfig = config;
  }

  /**
   * Get chat session by ID
   */
  async getSession(id: string): Promise<ChatSession> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock data
      return {
        id,
        company_id: 'mock-company',
        agent_id: 'mock-agent',
        user_phone: '+5511999999999',
        user_name: 'Mock User',
        status: 'active',
        started_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        metadata: {},
        tags: [],
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get chat session with messages
   */
  async getSessionWithMessages(id: string): Promise<ChatSessionWithMessages> {
    try {
      const session = await this.getSession(id);
      const messages = await this.getMessages(id);
      
      return {
        ...session,
        messages: messages.data,
        message_count: messages.total,
        ...(messages.data[0] && { last_message: messages.data[0] }),
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get messages for a session
   */
  async getMessages(sessionId: string, _params?: QueryParams): Promise<PaginatedResponse<ChatMessage>> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock data
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          session_id: sessionId,
          sender_type: 'user',
          content: 'Olá, preciso de ajuda',
          message_type: 'text',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
        {
          id: 'msg-2',
          session_id: sessionId,
          sender_type: 'agent',
          content: 'Olá! Como posso ajudá-lo?',
          message_type: 'text',
          timestamp: new Date().toISOString(),
          status: 'delivered',
        },
      ];

      return {
        data: mockMessages,
        count: mockMessages.length,
        total: mockMessages.length,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get chat sessions with filters
   */
  async getSessions(filter?: ChatFilter, _params?: QueryParams): Promise<PaginatedResponse<ChatSession>> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock data
      const mockSessions: ChatSession[] = [
        {
          id: 'session-1',
          company_id: filter?.company_id || 'mock-company',
          agent_id: filter?.agent_id || 'mock-agent',
          user_phone: '+5511999999999',
          user_name: 'Cliente 1',
          status: 'active',
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          metadata: {},
          tags: ['suporte'],
        },
      ];

      return {
        data: mockSessions,
        count: mockSessions.length,
        total: mockSessions.length,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new chat session
   */
  async createSession(data: CreateSessionData): Promise<ChatSession> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock data
      return {
        id: `session-${Date.now()}`,
        ...data,
        status: 'active',
        started_at: new Date().toISOString(),
        metadata: data.metadata || {},
        tags: [],
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send message in session
   */
  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    try {
      // TODO: Implement with Supabase and Evo AI in Phase 10
      // For now, return mock data
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        session_id: data.session_id,
        sender_type: 'user',
        content: data.content,
        message_type: data.message_type || 'text',
        metadata: data.metadata || {},
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      // TODO: Send to Evo AI
      // await this.sendToEvo(message);

      return message;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send message via Evo AI
   */
  async sendToEvo(_data: SendEvoMessageData): Promise<boolean> {
    try {
      if (!this.evoConfig) {
        throw new Error('Evo AI configuration not set');
      }

      // TODO: Implement Evo AI API call in Phase 10
      // const response = await fetch(`${this.evoConfig.serverUrl}/message/sendText/${this.evoConfig.instanceName}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'apikey': this.evoConfig.token,
      //   },
      //   body: JSON.stringify({
      //     number: data.number,
      //     text: data.text,
      //   }),
      // });
      
      // For now, return true (mock success)
      return true;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Process Evo AI webhook
   */
  async processEvoWebhook(_webhookData: EvoWebhookData): Promise<ChatMessage | null> {
    try {
      // TODO: Implement webhook processing in Phase 10
      // 1. Parse webhook data
      // 2. Find or create session
      // 3. Save message to database
      // 4. Trigger agent response if needed
      
      // For now, return null
      return null;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Close chat session
   */
  async closeSession(sessionId: string): Promise<ChatSession> {
    try {
      // TODO: Implement with Supabase in Phase 10
      const session = await this.getSession(sessionId);
      
      return {
        ...session,
        status: 'closed',
        ended_at: new Date().toISOString(),
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Transfer session to another agent
   */
  async transferSession(sessionId: string, newAgentId: string): Promise<ChatSession> {
    try {
      // TODO: Implement with Supabase in Phase 10
      const session = await this.getSession(sessionId);
      
      return {
        ...session,
        agent_id: newAgentId,
        status: 'transferred',
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get chat statistics
   */
  async getStats(_companyId?: string, _agentId?: string): Promise<ChatStats> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock data
      return {
        total_sessions: 150,
        active_sessions: 12,
        avg_response_time: 2.5,
        total_messages: 1250,
        satisfaction_score: 4.2,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(_sessionId: string, _messageIds: string[]): Promise<void> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, do nothing
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search messages
   */
  async searchMessages(_query: string, _filter?: ChatFilter): Promise<PaginatedResponse<ChatMessage>> {
    try {
      // TODO: Implement with Supabase full-text search in Phase 10
      // For now, return empty results
      return {
        data: [],
        count: 0,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get active sessions for agent
   */
  async getActiveSessionsForAgent(agentId: string): Promise<ChatSession[]> {
    try {
      const result = await this.getSessions(
        { agent_id: agentId, status: 'active' },
        { limit: 100 }
      );
      return result.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(_companyId: string): Promise<number> {
    try {
      // TODO: Implement with Supabase in Phase 10
      // For now, return mock count
      return 5;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const chatService = new ChatService();