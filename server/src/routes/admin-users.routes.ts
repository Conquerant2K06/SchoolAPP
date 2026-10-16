import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword } from '../lib/password.js';
import { toUserWithClassDto } from '../lib/serializers.js';
import { requireEmail, requireId, requirePassword, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export interface AdminRoutesDeps {
  store: Store;
  config: AppConfig;
}

/**
 * Gestion des comptes réservée à l'administrateur (création teacher/admin,
 * liste, désactivation).
 */
export function adminUsersRouter({ store, config }: AdminRoutesDeps): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const role = typeof req.query['role'] === 'string' ? (req.query['role'] as string) : undefined;
      if (role && !['admin', 'teacher', 'student'].includes(role)) {
        throw HttpError.badRequest('Rôle invalide');
      }
      const users = await store.listUsers(role as never);
      res.json({ users: users.map(toUserWithClassDto) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const email = requireEmail(req.body?.email);
      const password = requirePassword(req.body?.password);
      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });
      const role = req.body?.role === 'admin' || req.body?.role === 'teacher' ? req.body.role : null;
      if (!role) {
        throw HttpError.badRequest('Le rôle doit être « admin » ou « teacher »');
      }
      const existing = await store.findUserByEmail(email);
      if (existing) {
        throw HttpError.conflict('Cette adresse e-mail est déjà utilisée');
      }
      const passwordHash = await hashPassword(password);
      const user = await store.createUser({ email, passwordHash, fullName, role });
      res.status(201).json({ user: toUserWithClassDto({ ...user, class_name: null }) });
    }),
  );

  router.patch(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      if (typeof req.body?.active !== 'boolean') {
        throw HttpError.badRequest('Le champ « active » est requis');
      }
      const user = await store.setUserActive(id, req.body.active);
      if (!user) {
        throw HttpError.notFound('Utilisateur introuvable');
      }
      res.json({ user: toUserWithClassDto({ ...user, class_name: null }) });
    }),
  );

  return router;
}
