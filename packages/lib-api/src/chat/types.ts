export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video';
  metadata?: Record<string, any>;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ChatSession {
  id: string;
  company_id: string;
  agent_id: string;
  user_phone: string;
  user_name?: string;
  status: 'active' | 'waiting' | 'closed' | 'transferred';
  started_at: string;
  ended_at?: string;
  last_message_at?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface SendMessageData {
  session_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  metadata?: Record<string, any>;
}

export interface CreateSessionData {
  company_id: string;
  agent_id: string;
  user_phone: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
  message_count: number;
  last_message?: ChatMessage;
}

export interface ChatStats {
  total_sessions: number;
  active_sessions: number;
  avg_response_time: number;
  total_messages: number;
  satisfaction_score?: number;
}

export interface EvoWebhookData {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      imageMessage?: {
        url: string;
        mimetype: string;
        caption?: string;
      };
      audioMessage?: {
        url: string;
        mimetype: string;
      };
      documentMessage?: {
        url: string;
        mimetype: string;
        title: string;
      };
    };
    messageTimestamp: number;
    pushName?: string;
  };
}

export interface SendEvoMessageData {
  number: string;
  text?: string;
  media?: {
    type: 'image' | 'audio' | 'document';
    url: string;
    caption?: string;
    filename?: string;
  };
}

export interface EvoInstanceConfig {
  instanceName: string;
  token: string;
  serverUrl: string;
  webhook?: string;
  events?: string[];
}

export interface ChatFilter {
  company_id?: string;
  agent_id?: string;
  status?: ChatSession['status'];
  user_phone?: string;
  date_from?: string;
  date_to?: string;
  has_unread?: boolean;
}