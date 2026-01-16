import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const url = env.DATABASE_URL + (env.DATABASE_URL?.includes('?') ? '&' : '?') + 'timezone=Z';

// Serverless-optimized connection pool configuration
// In serverless environments, each function instance creates its own pool
// We need to minimize connections to avoid exhausting the database connection limit
const client = mysql.createPool({
  uri: url,

  // CRITICAL: Limit connections per serverless instance
  // Since functions are short-lived and handle one request at a time,
  // we only need 1-2 connections per instance
  connectionLimit: 2,

  // Maximum time to wait for a connection from the pool (in ms)
  // Fail fast if no connection is available
  queueLimit: 0,
  waitForConnections: true,
  acquireTimeout: 10000, // 10 seconds

  // Connection lifecycle settings
  // Close idle connections quickly to free up database resources
  idleTimeout: 30000, // 30 seconds - close idle connections
  maxIdle: 1, // Keep at most 1 idle connection

  // Enable keep-alive to detect dead connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // Timeout settings to prevent hanging connections
  connectTimeout: 10000, // 10 seconds to establish connection
});

// ensure each new pooled connection uses UTC
client.on("connection", (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const db: MySql2Database<typeof schema> = drizzle(client, {
  mode: "default",
  schema: schema,
});

// Connection pool monitoring (useful for debugging connection issues)
if (env.NODE_ENV !== 'production') {
  client.on('acquire', () => {
    console.log('[DB] Connection acquired from pool');
  });
  client.on('release', () => {
    console.log('[DB] Connection released back to pool');
  });
}

// Graceful shutdown handler for serverless environments
// This ensures connections are properly closed when the function terminates
export async function closePool() {
  try {
    await client.end();
    console.log('[DB] Connection pool closed gracefully');
  } catch (error) {
    console.error('[DB] Error closing connection pool:', error);
  }
}

// Export pool stats for monitoring
export function getPoolStats() {
  return {
    totalConnections: (client as any)._allConnections?.length ?? 0,
    freeConnections: (client as any)._freeConnections?.length ?? 0,
    queueLength: (client as any)._connectionQueue?.length ?? 0,
  };
}

export type { Facturas, Sucursales } from "./schema";
