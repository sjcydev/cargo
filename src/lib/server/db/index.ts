import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = await mysql.createConnection(env.DATABASE_URL);

export const db: MySql2Database<typeof schema> = drizzle(client, {
  mode: 'default',
  schema: schema,
});

