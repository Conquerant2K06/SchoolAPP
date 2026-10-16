import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { hashPassword } from '../lib/password.js';
import { toUserWithClassDto } from '../lib/serializers.js';
import { requireEmail, requireId, requirePassword, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function studentsRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const filter = {
        name: typeof req.query['name'] === 'string' ? (req.query['name'] as string) : undefined,
        classId: req.query['classId'] ? requireId(req.query['classId'], 'classId') : undefined,
        schoolYearId: req.query['schoolYearId'] ? requireId(req.query['schoolYearId'], 'schoolYearId') : undefined,
      };
      res.json({ students: (await store.listStudents(filter)).map(toUserWithClassDto) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const email = requireEmail(req.body?.email);
      const password = requirePassword(req.body?.password);
      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });
      const classId = req.body?.classId == null ? null : requireId(req.body.classId, 'classId');

      if (classId != null && !(await store.getClass(classId))) {
        throw HttpError.badRequest('Classe introuvable');
      }
      if (await store.findUserByEmail(email)) {
        throw HttpError.conflict('Cette adresse e-mail est déjà utilisée');
      }

      const passwordHash = await hashPassword(password);
      const user = await store.createUser({ email, passwordHash, fullName, role: 'student', classId });
      res.status(201).json({ student: toUserWithClassDto({ ...user, class_name: null }) });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const target = await store.findUserById(id);
      if (!target || target.role !== 'student') throw HttpError.notFound('Élève introuvable');

      const fullName = requireString(req.body?.fullName, 'nom complet', { min: 2, max: 120 });
      const classId = req.body?.classId == null ? null : requireId(req.body.classId, 'classId');
      const active = req.body?.active == null ? target.active : req.body.active === true;

      if (classId != null && !(await store.getClass(classId))) {
        throw HttpError.badRequest('Classe introuvable');
      }
      const user = await store.updateUser(id, { fullName, classId, active });
      res.json({ student: toUserWithClassDto({ ...(user as NonNullable<typeof user>), class_name: null }) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const target = await store.findUserById(id);
      if (!target || target.role !== 'student') throw HttpError.notFound('Élève introuvable');

      if ((await store.countNotesByStudent(id)) > 0) {
        throw HttpError.conflict('Impossible de supprimer : cet élève possède des notes');
      }
      await store.setUserActive(id, false);
      res.status(204).send();
    }),
  );

  return router;
}
