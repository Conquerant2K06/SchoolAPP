import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { toSubjectDto } from '../lib/serializers.js';
import { requireId, requirePositiveInt, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function subjectsRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json({ subjects: (await store.listSubjects()).map(toSubjectDto) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const name = requireString(req.body?.name, 'nom', { min: 1, max: 120 });
      const code = requireString(req.body?.code, 'code', { min: 1, max: 30 }).toUpperCase();
      const coefficient = requirePositiveInt(req.body?.coefficient, 'coefficient');
      const existing = await store.findSubjectByCode(code);
      if (existing) {
        throw HttpError.conflict('Ce code de matière est déjà utilisé');
      }
      const subject = await store.createSubject({ name, code, coefficient });
      res.status(201).json({ subject: toSubjectDto(subject) });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const name = requireString(req.body?.name, 'nom', { min: 1, max: 120 });
      const code = requireString(req.body?.code, 'code', { min: 1, max: 30 }).toUpperCase();
      const coefficient = requirePositiveInt(req.body?.coefficient, 'coefficient');
      const duplicate = await store.findSubjectByCode(code);
      if (duplicate && duplicate.id !== id) {
        throw HttpError.conflict('Ce code de matière est déjà utilisé');
      }
      const subject = await store.updateSubject(id, { name, code, coefficient });
      if (!subject) throw HttpError.notFound('Matière introuvable');
      res.json({ subject: toSubjectDto(subject) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const deleted = await store.deleteSubject(requireId(req.params['id']));
      if (!deleted) throw HttpError.notFound('Matière introuvable');
      res.status(204).send();
    }),
  );

  return router;
}
