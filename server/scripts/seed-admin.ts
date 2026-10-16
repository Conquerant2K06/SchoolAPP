import 'dotenv/config';
import { loadConfig } from '../src/config.js';
import { createPool } from '../src/db/pool.js';
import { PgStore } from '../src/db/store.js';
import { hashPassword } from '../src/lib/password.js';

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const pool = createPool(config.databaseUrl);
  const store = new PgStore(pool);

  try {
    const existing = await store.findUserByEmail(config.seedAdmin.email);
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`L'administrateur ${config.seedAdmin.email} existe déjà.`);
      return;
    }
    const passwordHash = await hashPassword(config.seedAdmin.password);
    await store.createUser({
      email: config.seedAdmin.email,
      passwordHash,
      fullName: config.seedAdmin.fullName,
      role: 'admin',
    });
    // eslint-disable-next-line no-console
    console.log(`Administrateur créé : ${config.seedAdmin.email}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Échec du seed administrateur:', error);
  process.exit(1);
});
