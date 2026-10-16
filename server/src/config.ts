export type Role = 'admin' | 'teacher' | 'student';

export interface AppConfig {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendOrigin: string;
  port: number;
  seedAdmin: {
    email: string;
    password: string;
    fullName: string;
  };
}

export interface EnvSource {
  [key: string]: string | undefined;
}

/**
 * Valide et normalise les variables d'environnement du backend.
 * Lève une erreur explicite si une variable requise est absente ou invalide.
 */
export function loadConfig(env: EnvSource): AppConfig {
  const databaseUrl = env['DATABASE_URL']?.trim();
  const jwtSecret = env['JWT_SECRET']?.trim();

  const missing: string[] = [];
  if (!databaseUrl) missing.push('DATABASE_URL');
  if (!jwtSecret) missing.push('JWT_SECRET');
  if (missing.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missing.join(', ')}`);
  }
  if (jwtSecret && jwtSecret.length < 16) {
    throw new Error('JWT_SECRET doit contenir au moins 16 caractères');
  }

  const rawPort = env['PORT'] ?? '3000';
  const port = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT invalide: ${rawPort}`);
  }

  return {
    databaseUrl: databaseUrl as string,
    jwtSecret: jwtSecret as string,
    jwtExpiresIn: env['JWT_EXPIRES_IN']?.trim() || '8h',
    frontendOrigin: env['FRONTEND_ORIGIN']?.trim() || 'http://localhost:4200',
    port,
    seedAdmin: {
      email: env['SEED_ADMIN_EMAIL']?.trim() || 'admin@schoolci.local',
      password: env['SEED_ADMIN_PASSWORD']?.trim() || 'Admin1234!',
      fullName: env['SEED_ADMIN_NAME']?.trim() || 'Administrateur',
    },
  };
}
