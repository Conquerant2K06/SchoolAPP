import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword } from '../lib/password.js';
import { toUserWithClassDto } from '../lib/serializers.js';
import { requireEmail, requireId, requirePassword, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function teachersRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const teachers = await store.listUsers('teacher');
      res.json({ teachers: teachers.map(toUserWithClassDto) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const email = requireEmail(req.body?.email);
      const password = requirePassword(req.body?.password);
      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });

      if (await store.findUserByEmail(email)) {
        throw HttpError.conflict('Cette adresse e-mail est déjà utilisée');
      }
      const passwordHash = await hashPassword(password);
      const user = await store.createUser({ email, passwordHash, fullName, role: 'teacher' });
      res.status(201).json({ teacher: toUserWithClassDto({ ...user, class_name: null }) });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const target = await store.findUserById(id);
      if (!target || target.role !== 'teacher') throw HttpError.notFound('Enseignant introuvable');

      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });
      const active = req.body?.active == null ? target.active : req.body.active === true;
      const user = await store.updateUser(id, { fullName, classId: target.class_id, active });
      res.json({ teacher: toUserWithClassDto({ ...(user as NonNullable<typeof user>), class_name: null }) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const target = await store.findUserById(id);
      if (!target || target.role !== 'teacher') throw HttpError.notFound('Enseignant introuvable');

      if ((await store.listAssignments({ teacherId: id })).length > 0) {
        throw HttpError.conflict('Impossible de supprimer : cet enseignant a des affectations');
      }
      await store.setUserActive(id, false);
      res.status(204).send();
    }),
  );

  return router;
}
