import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPool } from './db/pool.js';
import { PgStore } from './db/store.js';

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const pool = createPool(config.databaseUrl);
  const store = new PgStore(pool);
  const app = createApp({ store, config });

  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API SchoolCI à l'écoute sur http://localhost:${config.port}`);
  });

  const shutdown = async (): Promise<void> => {
    server.close();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Échec du démarrage du serveur:', error);
  process.exit(1);
});
