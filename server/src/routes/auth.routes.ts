import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { toUserDto } from '../lib/serializers.js';
import { signToken } from '../lib/token.js';
import { requireEmail, requirePassword, requireString } from '../lib/validation.js';
import { requireAuth } from '../middleware/auth.js';

export interface AuthRoutesDeps {
  store: Store;
  config: AppConfig;
}

export function authRouter({ store, config }: AuthRoutesDeps): Router {
  const router = Router();
  const requireAuthMiddleware = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });

  // POST /api/auth/register — inscription ouverte, rôle student par défaut.
  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const email = requireEmail(req.body?.email);
      const password = requirePassword(req.body?.password);
      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });

      const existing = await store.findUserByEmail(email);
      if (existing) {
        throw HttpError.conflict('Cette adresse e-mail est déjà utilisée');
      }

      const passwordHash = await hashPassword(password);
      const user = await store.createUser({ email, passwordHash, fullName, role: 'student' });
      res.status(201).json({ user: toUserDto(user) });
    }),
  );

  // POST /api/auth/login — émet un JWT ; message unique en cas d'échec.
  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';

      const user = email ? await store.findUserByEmail(email) : null;
      const valid = user ? await verifyPassword(password, user.password_hash) : false;
      if (!user || !user.active || !valid) {
        throw HttpError.unauthorized('Identifiants invalides');
      }

      const token = signToken({ sub: user.id, email: user.email, role: user.role }, config.jwtSecret, config.jwtExpiresIn);
      res.json({ token, user: toUserDto(user) });
    }),
  );

  // POST /api/auth/logout — le client supprime le jeton ; réponse idempotente.
  router.post(
    '/logout',
    requireAuthMiddleware,
    asyncHandler(async (_req, res) => {
      res.status(204).send();
    }),
  );

  // GET /api/auth/me — retourne l'utilisateur courant.
  router.get(
    '/me',
    requireAuthMiddleware,
    asyncHandler(async (req, res) => {
      res.json({ user: toUserDto(req.user as NonNullable<typeof req.user>) });
    }),
  );

  return router;
}
