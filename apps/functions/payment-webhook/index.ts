import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyWebhookSignature } from "../_shared/webhook-utils.ts";

interface PaymentWebhookPayload {
  provider: 'openpix' | 'asaas';
  event: string;
  data: any;
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

    const payload: PaymentWebhookPayload = await req.json();
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('asaas-signature');
    
    // Verify webhook signature based on provider
    const secretKey = payload.provider === 'openpix' 
      ? Deno.env.get('OPENPIX_WEBHOOK_SECRET')
      : Deno.env.get('ASAAS_WEBHOOK_SECRET');
    
    if (!verifyWebhookSignature(req, secretKey!, signature!)) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process payment webhook based on provider
    let paymentUpdate = {};
    
    if (payload.provider === 'openpix') {
      paymentUpdate = await processOpenPixWebhook(payload, supabase);
    } else if (payload.provider === 'asaas') {
      paymentUpdate = await processAsaasWebhook(payload, supabase);
    }

    return new Response(
      JSON.stringify({ success: true, data: paymentUpdate }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Payment webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processOpenPixWebhook(payload: PaymentWebhookPayload, supabase: any) {
  const { event, data } = payload;
  
  switch (event) {
    case 'OPENPIX:CHARGE_COMPLETED':
      return await updatePaymentStatus(
        supabase,
        data.correlationID,
        'paid',
        {
          provider_payment_id: data.charge.id,
          paid_at: new Date(data.charge.paidAt).toISOString(),
          provider_data: data
        }
      );
      
    case 'OPENPIX:CHARGE_EXPIRED':
      return await updatePaymentStatus(
        supabase,
        data.correlationID,
        'failed',
        {
          provider_payment_id: data.charge.id,
          provider_data: data
        }
      );
      
    default:
      console.log('Unhandled OpenPix event:', event);
      return { message: 'Event received but not processed' };
  }
}

async function processAsaasWebhook(payload: PaymentWebhookPayload, supabase: any) {
  const { event, data } = payload;
  
  switch (event) {
    case 'PAYMENT_RECEIVED':
      return await updatePaymentStatus(
        supabase,
        data.externalReference,
        'paid',
        {
          provider_payment_id: data.id,
          paid_at: new Date(data.paymentDate).toISOString(),
          provider_data: data
        }
      );
      
    case 'PAYMENT_OVERDUE':
    case 'PAYMENT_DELETED':
      return await updatePaymentStatus(
        supabase,
        data.externalReference,
        'failed',
        {
          provider_payment_id: data.id,
          provider_data: data
        }
      );
      
    default:
      console.log('Unhandled Asaas event:', event);
      return { message: 'Event received but not processed' };
  }
}

async function updatePaymentStatus(
  supabase: any,
  externalReference: string,
  status: string,
  updateData: any
) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      status,
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', externalReference)
    .select();

  if (error) {
    console.error('Error updating payment:', error);
    throw error;
  }

  // If payment was successful, update company plan if needed
  if (status === 'paid' && data?.[0]) {
    await activateCompanyPlan(supabase, data[0]);
  }

  return data?.[0];
}

async function activateCompanyPlan(supabase: any, payment: any) {
  try {
    // Update company with new plan
    const { error } = await supabase
      .from('companies')
      .update({
        plan_id: payment.plan_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.company_id);

    if (error) {
      console.error('Error updating company plan:', error);
    }
  } catch (error) {
    console.error('Error in activateCompanyPlan:', error);
  }
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payment-webhook' \
    --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --data '{
      "provider": "openpix",
      "event": "OPENPIX:CHARGE_COMPLETED",
      "data": {
        "correlationID": "payment-uuid",
        "charge": {
          "id": "charge-123",
          "paidAt": "2024-01-15T10:30:00Z"
        }
      }
    }'

*/