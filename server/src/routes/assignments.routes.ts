import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { AssignmentRow, Store } from '../db/store.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { requireId } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

function toAssignmentDto(row: AssignmentRow) {
  return { id: row.id, teacherId: row.teacher_id, subjectId: row.subject_id, classId: row.class_id };
}

export function assignmentsRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin'));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const filter = {
        teacherId: req.query['teacherId'] ? Number(req.query['teacherId']) : undefined,
        classId: req.query['classId'] ? Number(req.query['classId']) : undefined,
        subjectId: req.query['subjectId'] ? Number(req.query['subjectId']) : undefined,
      };
      res.json({ assignments: (await store.listAssignments(filter)).map(toAssignmentDto) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const teacherId = requireId(req.body?.teacherId, 'teacherId');
      const subjectId = requireId(req.body?.subjectId, 'subjectId');
      const classId = requireId(req.body?.classId, 'classId');

      const teacher = await store.findUserById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        throw HttpError.badRequest("L'enseignant indiqué est introuvable");
      }
      if (!(await store.getClass(classId))) throw HttpError.badRequest('Classe introuvable');
      if (!(await store.getSubject(subjectId))) throw HttpError.badRequest('Matière introuvable');

      const assignment = await store.createAssignment({ teacherId, subjectId, classId });
      res.status(201).json({ assignment: toAssignmentDto(assignment) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const deleted = await store.deleteAssignment(requireId(req.params['id']));
      if (!deleted) throw HttpError.notFound('Affectation introuvable');
      res.status(204).send();
    }),
  );

  return router;
}
