import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Create a mock database for development
const mockDb = {
  query: async () => [],
  execute: async () => ({ rowsAffected: 0 }),
  transaction: async (callback: (db: typeof mockDb) => Promise<any>) => callback(mockDb),
  // Add other necessary mock methods as needed
};

let db: any;

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Only use real database if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn('Running without database - using mock data');
  db = mockDb;
}

export { db };