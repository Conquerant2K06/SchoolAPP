import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { assertCanManageGrades, resolveSchoolYear } from '../lib/access.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { toNoteDto } from '../lib/serializers.js';
import { requireGradeValue, requireId, requirePositiveInt, requireTrimester } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const MAX_PAGE_SIZE = 100;

export function gradesRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin', 'teacher'));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const filter = {
        classId: req.query['classId'] ? requireId(req.query['classId'], 'classId') : undefined,
        subjectId: req.query['subjectId'] ? requireId(req.query['subjectId'], 'subjectId') : undefined,
        studentId: req.query['studentId'] ? requireId(req.query['studentId'], 'studentId') : undefined,
        trimester: req.query['trimester'] ? requireTrimester(req.query['trimester']) : undefined,
        schoolYearId: req.query['schoolYearId'] ? requireId(req.query['schoolYearId'], 'schoolYearId') : undefined,
      };

      // Un enseignant doit filtrer sur un couple matière/classe qui lui est affecté.
      if (user.role === 'teacher') {
        if (!filter.classId || !filter.subjectId) {
          throw HttpError.forbidden('Précisez une matière et une classe');
        }
        await assertCanManageGrades(store, user, filter.subjectId, filter.classId);
      }

      const page = req.query['page'] ? Math.max(1, requireId(req.query['page'], 'page')) : 1;
      const pageSize = req.query['pageSize']
        ? Math.min(MAX_PAGE_SIZE, requirePositiveInt(req.query['pageSize'], 'pageSize'))
        : 20;
      const offset = (page - 1) * pageSize;

      const { rows, total } = await store.listNotes(filter, pageSize, offset);
      res.json({
        grades: rows.map(toNoteDto),
        pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const studentId = requireId(req.body?.studentId, 'studentId');
      const subjectId = requireId(req.body?.subjectId, 'subjectId');
      const trimester = requireTrimester(req.body?.trimester);
      const value = requireGradeValue(req.body?.value);
      const coefficient = req.body?.coefficient == null ? 1 : requirePositiveInt(req.body?.coefficient, 'coefficient');
      const schoolYear = await resolveSchoolYear(
        store,
        req.body?.schoolYearId == null ? undefined : requireId(req.body.schoolYearId, 'schoolYearId'),
      );

      const student = await store.findUserById(studentId);
      if (!student || student.role !== 'student') throw HttpError.badRequest('Élève introuvable');
      if (student.class_id == null) throw HttpError.badRequest("Cet élève n'est affecté à aucune classe");
      if (!(await store.getSubject(subjectId))) throw HttpError.badRequest('Matière introuvable');

      await assertCanManageGrades(store, user, subjectId, student.class_id);

      const note = await store.createNote({
        studentId,
        subjectId,
        classId: student.class_id,
        schoolYearId: schoolYear.id,
        trimester,
        value,
        coefficient,
      });
      res.status(201).json({ grade: toNoteDto(note) });
    }),
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const id = requireId(req.params['id']);
      const existing = await store.getNote(id);
      if (!existing) throw HttpError.notFound('Note introuvable');
      await assertCanManageGrades(store, user, existing.subject_id, existing.class_id);

      const value = requireGradeValue(req.body?.value);
      const coefficient = req.body?.coefficient == null ? existing.coefficient : requirePositiveInt(req.body?.coefficient, 'coefficient');
      const note = await store.updateNote(id, { value, coefficient });
      res.json({ grade: toNoteDto(note as NonNullable<typeof note>) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const id = requireId(req.params['id']);
      const existing = await store.getNote(id);
      if (!existing) throw HttpError.notFound('Note introuvable');
      await assertCanManageGrades(store, user, existing.subject_id, existing.class_id);
      await store.deleteNote(id);
      res.status(204).send();
    }),
  );

  return router;
}
