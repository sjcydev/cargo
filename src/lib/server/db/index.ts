import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const url = env.DATABASE_URL + (env.DATABASE_URL?.includes('?') ? '&' : '?') + 'timezone=Z';
const client = mysql.createPool(url);

// ensure each new pooled connection uses UTC
client.on("connection", (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const db: MySql2Database<typeof schema> = drizzle(client, {
  mode: "default",
  schema: schema,
});

