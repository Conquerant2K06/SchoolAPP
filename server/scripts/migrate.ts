import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from '../src/db/pool.js';

async function main(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL est requis pour exécuter les migrations');
  }

  const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  const pool = createPool(databaseUrl);
  try {
    for (const file of files) {
      const sql = await readFile(join(migrationsDir, file), 'utf8');
      // eslint-disable-next-line no-console
      console.log(`Application de la migration ${file}...`);
      await pool.query(sql);
    }
    // eslint-disable-next-line no-console
    console.log('Migrations terminées.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Échec des migrations:', error);
  process.exit(1);
});
