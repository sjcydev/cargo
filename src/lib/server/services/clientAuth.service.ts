import { db } from '$lib/server/db';
import { clientAuthTokens, clientDeviceSessions, usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { encodeBase64url } from '@oslojs/encoding';
import { logger } from '$lib/server/logger';

class ClientAuthService {
  /**
   * Generate a magic link token for client login
   * @param email - Client email address
   * @returns token string if email exists in usuarios table, null otherwise
   */
  async generateMagicLink(email: string): Promise<string | null> {
    // 1. Check if email exists in usuarios table
    const cliente = await db.query.usuarios.findFirst({
      where: (usuarios, { eq, and }) =>
        and(
          eq(usuarios.correo, email),
          eq(usuarios.archivado, false)
        ),
      columns: { id: true, correo: true }
    });

    if (!cliente) {
      // Security: Don't reveal if email exists
      logger.warn('Magic link requested for non-existent email', { email });
      return null;
    }

    // 2. Delete any existing tokens for this email (expired or not)
    // This ensures clean state and prevents token accumulation
    await db.delete(clientAuthTokens)
      .where(eq(clientAuthTokens.clientEmail, email));

    // 3. Generate cryptographically secure random token
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = encodeBase64url(bytes);

    // 4. Calculate expiry (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Store token in database
    await db.insert(clientAuthTokens).values({
      clientEmail: email,
      token,
      expiresAt,
      used: false
    });

    logger.info('Magic link token generated', { email, expiresAt });

    return token;
  }

  /**
   * Verify magic link token and return client ID if valid
   * @param token - Magic link token from URL
   * @returns clientId if valid, null otherwise
   */
  async verifyMagicToken(token: string): Promise<number | null> {
    // 1. Find token in database
    const authToken = await db.query.clientAuthTokens.findFirst({
      where: eq(clientAuthTokens.token, token)
    });

    if (!authToken) {
      logger.warn('Invalid magic link token', { token });
      return null;
    }

    // 2. Check if already used
    if (authToken.used) {
      logger.warn('Magic link token already used', { token });
      return null;
    }

    // 3. Check expiry
    if (authToken.expiresAt < new Date()) {
      logger.warn('Magic link token expired', { token, expiresAt: authToken.expiresAt });
      return null;
    }

    // 4. Mark token as used (in transaction with client lookup)
    const cliente = await db.transaction(async (tx) => {
      // Mark used
      await tx.update(clientAuthTokens)
        .set({ used: true })
        .where(eq(clientAuthTokens.id, authToken.id));

      // Get client
      const client = await tx.query.usuarios.findFirst({
        where: (usuarios, { eq, and }) =>
          and(
            eq(usuarios.correo, authToken.clientEmail),
            eq(usuarios.archivado, false)
          ),
        columns: { id: true }
      });

      return client;
    });

    if (!cliente) {
      logger.error('Client not found after token validation', { email: authToken.clientEmail });
      return null;
    }

    logger.info('Magic link token verified successfully', { clientId: cliente.id });

    return cliente.id;
  }

  /**
   * Create a new client session
   * @param clientId - Usuario ID
   * @param userAgent - Browser user agent string
   * @returns session ID
   */
  async createClientSession(clientId: number, userAgent?: string): Promise<string> {
    // Generate session ID (similar to admin auth pattern)
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const sessionId = encodeBase64url(bytes);

    // 30 day expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(clientDeviceSessions).values({
      id: sessionId,
      clientId,
      userAgent,
      expiresAt
    });

    logger.info('Client session created', { clientId, sessionId });

    return sessionId;
  }

  /**
   * Validate client session and return client data
   * @param sessionId - Session ID from cookie
   * @returns Client data if valid, null otherwise
   */
  async validateClientSession(sessionId: string) {
    const session = await db.query.clientDeviceSessions.findFirst({
      where: eq(clientDeviceSessions.id, sessionId),
      with: {
        client: {
          columns: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            casillero: true,
            codificacion: true,
            tipo: true,
            sucursalId: true
          }
        }
      }
    });

    if (!session) {
      return null;
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      logger.info('Client session expired', { sessionId });
      return null;
    }

    // Update last active
    await db.update(clientDeviceSessions)
      .set({ lastActive: new Date() })
      .where(eq(clientDeviceSessions.id, sessionId));

    return {
      session,
      client: session.client
    };
  }

  /**
   * Revoke client session (logout)
   */
  async revokeClientSession(sessionId: string): Promise<void> {
    await db.delete(clientDeviceSessions)
      .where(eq(clientDeviceSessions.id, sessionId));

    logger.info('Client session revoked', { sessionId });
  }
}

export const clientAuthService = new ClientAuthService();
