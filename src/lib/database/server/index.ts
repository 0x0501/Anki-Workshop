import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from '../schema'; // Import your schema
import type { D1Database } from '@cloudflare/workers-types'; // Import D1Database type

/**
 * Initializes the Drizzle ORM instance for Cloudflare D1.
 * This function should be called with the D1 database binding.
 *
 * @param d1Database The Cloudflare D1 database binding.
 * @returns The Drizzle ORM instance.
 */
export function initializeDrizzle(d1Database: D1Database): DrizzleD1Database<typeof schema> {
  const db = drizzle(d1Database, { schema });
  return db;
}

// Optional: Export db directly if you ensure hooks run first, but function approach is safer.
// export const db = _db; // This might be null if accessed before hooks run
