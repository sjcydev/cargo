import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { apiHandler } from '$lib/server/api/handler';
import { clientAuthService } from '$lib/server/services/clientAuth.service';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from './$types';

// Rate limiting state (in-memory, simple implementation)
// For production, consider Redis or database-backed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || limit.resetAt < now) {
    // Reset or initialize
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 3) {
    // Max 3 requests per minute per IP
    return false;
  }

  limit.count++;
  return true;
}

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const POST: RequestHandler = apiHandler(async ({ request, getClientAddress, url }) => {
  // 1. Rate limiting
  const clientIp = getClientAddress();
  if (!checkRateLimit(clientIp)) {
    logger.warn('Rate limit exceeded for magic link request', { ip: clientIp });
    return json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // 2. Validate email
  const body = await request.json();
  const { email } = requestSchema.parse(body);

  logger.info('Magic link requested', { email, ip: clientIp });

  // 3. Generate token (may return null if email doesn't exist)
  const token = await clientAuthService.generateMagicLink(email);

  // 4. If token generated, send email
  if (token) {
    const baseUrl = url.origin;
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    console.log(magicLink)

    // Send magic link email
    try {
      await sendMagicLinkEmail(email, magicLink);
      logger.info('Magic link email sent', { email });
    } catch (error) {
      logger.error('Failed to send magic link email', { email, error });
      // Don't reveal error to user
    }
  }

  // 5. Always return generic success message (security through obscurity)
  // This prevents email enumeration attacks
  return json({
    success: true,
    message: 'If an account exists with that email, we sent you a login link.'
  });
});

/**
 * Send magic link email via existing email infrastructure
 * For now, uses console.log in dev mode
 * TODO: Integrate with actual email service based on API_BASE_URL pattern
 */
async function sendMagicLinkEmail(email: string, magicLink: string): Promise<void> {
  // Placeholder implementation
  // In production, this should use the existing email service pattern from CLAUDE.md
  // which delegates to external API service

  const emailPayload = {
    to: email,
    subject: 'Your Login Link - Cargo Portal',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Welcome back!</h2>
        <p style="color: #6B7280; font-size: 16px;">Click the link below to access your cargo portal:</p>
        <a href="${magicLink}"
           style="display: inline-block; background: #111827; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Access My Account
        </a>
        <p style="color: #9CA3AF; font-size: 14px;">
          This link will expire in 15 minutes for security.
        </p>
        <p style="color: #9CA3AF; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `
  };

  // Integration point for existing email service
  // await emailService.send(emailPayload);

  console.log('Magic link email (dev mode):', magicLink);
  console.log('Email payload:', emailPayload);
}
