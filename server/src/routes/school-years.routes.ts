import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { SchoolYearRow, Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { requireId, requireString } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

function toYearDto(year: SchoolYearRow) {
  return { id: year.id, label: year.label, active: year.active };
}

export function schoolYearsRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth);

  // Lecture ouverte aux rôles authentifiés (nécessaire aux sélecteurs du front).
  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json({ schoolYears: (await store.listSchoolYears()).map(toYearDto) });
    }),
  );

  router.get(
    '/active',
    asyncHandler(async (_req, res) => {
      const year = await store.getActiveSchoolYear();
      res.json({ schoolYear: year ? toYearDto(year) : null });
    }),
  );

  router.get(
    '/:id/trimesters',
    asyncHandler(async (req, res) => {
      const id = requireId(req.params['id']);
      const trimesters = await store.listTrimesters(id);
      res.json({ trimesters: trimesters.map((t) => ({ id: t.id, number: t.number, schoolYearId: t.school_year_id })) });
    }),
  );

  router.post(
    '/',
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const label = requireString(req.body?.label, 'libellé', { min: 4, max: 40 });
      const activate = req.body?.active === true;
      const year = await store.createSchoolYear(label, activate);
      res.status(201).json({ schoolYear: toYearDto(year) });
    }),
  );

  router.patch(
    '/:id/activate',
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const year = await store.setActiveSchoolYear(requireId(req.params['id']));
      if (!year) throw HttpError.notFound('Année scolaire introuvable');
      res.json({ schoolYear: toYearDto(year) });
    }),
  );

  return router;
}
