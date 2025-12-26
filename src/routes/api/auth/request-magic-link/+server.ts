import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { apiHandler } from '$lib/server/api/handler';
import { clientAuthService } from '$lib/server/services/clientAuth.service';
import { logger } from '$lib/server/logger';
import { Resend } from 'resend';
import { PRIVATE_RESEND_API_KEY } from '$env/static/private';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { companies } from '$lib/server/db/schema';
import { getMagicLinkEmailHTML, getMagicLinkEmailText } from '$lib/server/email/templates/magic-link';
import { getFriendlyUrl } from '$lib/server/s3';
import type { RequestHandler } from './$types';

const resend = new Resend(PRIVATE_RESEND_API_KEY);

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

    // Send magic link email
    try {
      await sendMagicLinkEmail(email, magicLink);
    } catch (error) {
      // Error already logged in sendMagicLinkEmail
      // Don't reveal error to user for security
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
 * Send magic link email via Resend
 * In dev mode: sends to sjcydev12@gmail.com from noreply@resend.dev
 * In production: sends to actual user email from company domain
 */
async function sendMagicLinkEmail(email: string, magicLink: string): Promise<void> {
	const startTime = Date.now();

	try {
		// Fetch company info for branding
		const companyResult = await db
			.select({
				company: companies.company,
				dominio: companies.dominio,
				logo: companies.logo
			})
			.from(companies)
			.limit(1);

		const companyName = companyResult[0]?.company || 'Cargo Portal';
		const companyDomain = companyResult[0]?.dominio;
		const logoUrl = companyResult[0]?.logo ? getFriendlyUrl(companyResult[0].logo) : undefined;

		// Determine email recipient and sender based on environment
		const recipientEmail = dev ? 'sjcydev12@gmail.com' : email;
		const fromEmail = dev
			? `${companyName} <noreply@resend.dev>`
			: `${companyName} <noreply@${companyDomain}>`;

		// Log in dev mode for debugging
		if (dev) {
			console.log('='.repeat(80));
			console.log('MAGIC LINK EMAIL (DEV MODE):');
			console.log(`To: ${recipientEmail} (original: ${email})`);
			console.log(`From: ${fromEmail}`);
			console.log(`Magic Link: ${magicLink}`);
			console.log('='.repeat(80));
		}

		// Send email via Resend
		const { data, error } = await resend.emails.send({
			from: fromEmail,
			to: recipientEmail,
			subject: 'Tu Enlace de Acceso - ' + companyName,
			html: getMagicLinkEmailHTML(magicLink, companyName, logoUrl),
			text: getMagicLinkEmailText(magicLink, companyName)
		});

		if (error) {
			throw error;
		}

		const latencyMs = Date.now() - startTime;

		logger.info('Magic link email sent successfully', {
			email: dev ? `${email} (sent to ${recipientEmail})` : email,
			messageId: data?.id,
			provider: 'resend',
			latencyMs,
			isDev: dev
		});
	} catch (error) {
		const latencyMs = Date.now() - startTime;

		logger.error('Failed to send magic link email', {
			email,
			error,
			latencyMs,
			isDev: dev
		});

		throw error;
	}
}
