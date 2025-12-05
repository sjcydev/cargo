/**
 * Centralized API error handling utility
 * Provides consistent error responses and logging across all API endpoints
 */

import { json, error as svelteKitError } from "@sveltejs/kit";
import { ZodError } from "zod";
import { logger } from "$lib/server/logger";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * API error types with corresponding HTTP status codes
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wraps an API handler with centralized error handling
 *
 * Usage:
 * export const POST = apiHandler(async ({ request, locals }) => {
 *   // Your handler logic here
 *   return json({ success: true });
 * });
 *
 * @param handler - The API handler function
 * @returns Wrapped handler with error handling
 */
export const apiHandler = <T = any>(
  handler: (event: RequestEvent) => Promise<Response>
) => {
  return async (event: RequestEvent): Promise<Response> => {
    try {
      return await handler(event);
    } catch (err) {
      // Log the error with context
      logger.error("API Error", {
        path: event.url.pathname,
        method: event.request.method,
        userId: event.locals.user?.id,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });

      // Handle Zod validation errors
      if (err instanceof ZodError) {
        return json(
          {
            error: "Invalid input",
            details: err.errors,
          },
          { status: 400 }
        );
      }

      // Handle custom API errors
      if (err instanceof ApiError) {
        return json(
          {
            error: err.message,
            details: err.details,
          },
          { status: err.statusCode }
        );
      }

      // Handle SvelteKit errors (thrown with error() helper)
      if (err && typeof err === "object" && "status" in err && "body" in err) {
        throw err; // Re-throw SvelteKit errors to be handled by the framework
      }

      // Default: Internal server error
      // Don't expose internal error details to clients in production
      return json(
        {
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
};

/**
 * Helper to require authentication in API handlers
 * Throws 401 if user is not authenticated
 *
 * Usage:
 * export const POST = apiHandler(async (event) => {
 *   requireAuth(event);
 *   // Your authenticated handler logic here
 * });
 */
export const requireAuth = (event: RequestEvent) => {
  if (!event.locals.user) {
    throw svelteKitError(401, "Unauthorized");
  }
  return event.locals.user;
};

/**
 * Helper to require specific role(s) in API handlers
 * Throws 401 if not authenticated, 403 if insufficient permissions
 *
 * Usage:
 * export const DELETE = apiHandler(async (event) => {
 *   requireRole(event, ['ADMIN']);
 *   // Your admin-only handler logic here
 * });
 */
export const requireRole = (event: RequestEvent, allowedRoles: string[]) => {
  const user = requireAuth(event);

  if (!allowedRoles.includes(user.rol)) {
    throw svelteKitError(403, "Insufficient permissions");
  }

  return user;
};
