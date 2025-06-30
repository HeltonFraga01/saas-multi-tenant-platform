import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

export function verifyWebhookSignature(
  req: Request,
  secret: string,
  signature: string
): boolean {
  try {
    // For OpenPix, signature is in format "sha256=hash"
    // For Asaas, signature is just the hash
    const expectedSignature = signature.startsWith('sha256=') 
      ? signature.substring(7)
      : signature;

    // Get request body
    const body = req.body;
    if (!body) return false;

    // Create HMAC
    const hmac = createHmac('sha256', secret);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');

    // Compare signatures
    return calculatedSignature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

export function validateWebhookPayload(payload: any, requiredFields: string[]): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return requiredFields.every(field => {
    const keys = field.split('.');
    let current = payload;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  });
}

export function sanitizeWebhookData(data: any): any {
  // Remove sensitive fields that shouldn't be stored
  const sensitiveFields = ['password', 'token', 'secret', 'key'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeWebhookData(sanitized[key]);
    }
  }

  return sanitized;
}