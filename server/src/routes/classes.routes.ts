import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { toClassDto } from '../lib/serializers.js';
import { requireId, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function classesRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json({ classes: (await store.listClasses()).map(toClassDto) });
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const klass = await store.getClass(requireId(req.params['id']));
      if (!klass) throw HttpError.notFound('Classe introuvable');
      res.json({ class: toClassDto(klass) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const name = requireString(req.body?.name, 'nom', { min: 1, max: 120 });
      const level = req.body?.level == null ? null : requireString(req.body.level, 'niveau', { max: 60 });
      const klass = await store.createClass({ name, level });
      res.status(201).json({ class: toClassDto(klass) });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const name = requireString(req.body?.name, 'nom', { min: 1, max: 120 });
      const level = req.body?.level == null ? null : requireString(req.body.level, 'niveau', { max: 60 });
      const klass = await store.updateClass(id, { name, level });
      if (!klass) throw HttpError.notFound('Classe introuvable');
      res.json({ class: toClassDto(klass) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const students = await store.countStudentsInClass(id);
      if (students > 0) {
        throw HttpError.conflict('Impossible de supprimer : la classe contient encore des élèves');
      }
      const deleted = await store.deleteClass(id);
      if (!deleted) throw HttpError.notFound('Classe introuvable');
      res.status(204).send();
    }),
  );

  return router;
}
