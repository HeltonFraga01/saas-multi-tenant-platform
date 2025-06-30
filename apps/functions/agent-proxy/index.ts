import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface AgentProxyRequest {
  agentId: string;
  action: 'sendMessage' | 'getMessages' | 'getSessions' | 'createSession';
  data?: any;
}

interface EvoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const payload: AgentProxyRequest = await req.json();
    const { agentId, action, data } = payload;

    // Verify user has access to the agent
    const { data: agentAccess, error: accessError } = await supabase
      .from('agent_assignments')
      .select(`
        agent_id,
        agents!inner(
          id,
          name,
          evo_instance_url,
          evo_api_key,
          company_id,
          status
        )
      `)
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .single();

    if (accessError || !agentAccess) {
      return new Response(
        JSON.stringify({ error: 'Agent not found or access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const agent = agentAccess.agents;
    
    if (agent.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Agent is not active' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Proxy request to Evo AI
    const evoResponse = await proxyToEvoAI(agent, action, data);
    
    // Store chat data in our database if needed
    if (action === 'sendMessage' && evoResponse.success) {
      await storeChatMessage(supabase, agent.company_id, agentId, data, evoResponse.data);
    }

    return new Response(
      JSON.stringify(evoResponse),
      { 
        status: evoResponse.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Agent proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function proxyToEvoAI(
  agent: any, 
  action: string, 
  data: any
): Promise<EvoApiResponse> {
  try {
    const baseUrl = agent.evo_instance_url.replace(/\/$/, '');
    let endpoint = '';
    let method = 'GET';
    let body = null;

    switch (action) {
      case 'sendMessage':
        endpoint = '/message/sendText';
        method = 'POST';
        body = JSON.stringify({
          number: data.phone,
          text: data.message,
          delay: data.delay || 0
        });
        break;
        
      case 'getMessages':
        endpoint = `/message/findMessages/${data.phone}`;
        method = 'GET';
        break;
        
      case 'getSessions':
        endpoint = '/chat/findChats';
        method = 'GET';
        break;
        
      case 'createSession':
        endpoint = '/chat/whatsappNumbers';
        method = 'GET';
        break;
        
      default:
        return { success: false, error: 'Invalid action' };
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': agent.evo_api_key,
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Evo AI API error:', response.status, errorText);
      return { 
        success: false, 
        error: `Evo AI API error: ${response.status}` 
      };
    }

    const responseData = await response.json();
    return { success: true, data: responseData };

  } catch (error) {
    console.error('Error calling Evo AI:', error);
    return { 
      success: false, 
      error: 'Failed to communicate with Evo AI' 
    };
  }
}

async function storeChatMessage(
  supabase: any,
  companyId: string,
  agentId: string,
  requestData: any,
  responseData: any
) {
  try {
    // Find or create chat session
    let { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('company_id', companyId)
      .eq('agent_id', agentId)
      .eq('user_phone', requestData.phone)
      .eq('status', 'active')
      .single();

    if (sessionError || !session) {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          company_id: companyId,
          agent_id: agentId,
          user_phone: requestData.phone,
          status: 'active',
          metadata: {
            created_via: 'agent_proxy',
            user_agent: 'evo_ai'
          }
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating chat session:', createError);
        return;
      }
      
      session = newSession;
    }

    // Store the message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        message_id: responseData.key?.id || `msg_${Date.now()}`,
        content: requestData.message,
        sender_type: 'agent',
        sender_name: 'Agent',
        message_type: 'text',
        metadata: {
          evo_response: responseData,
          sent_at: new Date().toISOString()
        }
      });

    if (messageError) {
      console.error('Error storing chat message:', messageError);
    }

    // Update session last message time
    await supabase
      .from('chat_sessions')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', session.id);

  } catch (error) {
    console.error('Error in storeChatMessage:', error);
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/agent-proxy' \
    --header 'Authorization: Bearer [YOUR_JWT_TOKEN]' \
    --header 'Content-Type: application/json' \
    --data '{
      "agentId": "agent-uuid",
      "action": "sendMessage",
      "data": {
        "phone": "+5511999999999",
        "message": "Hello from agent!",
        "delay": 0
      }
    }'

*/