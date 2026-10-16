import { Pool } from 'pg';

/**
 * Crée un pool de connexions PostgreSQL (Neon). Le SSL est activé par défaut
 * en production ; il est désactivé localement lorsque la chaîne l'indique.
 */
export function createPool(databaseUrl: string): Pool {
  const needsSsl = !/sslmode=disable/.test(databaseUrl);
  return new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
}
