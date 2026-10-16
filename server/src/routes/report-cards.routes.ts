import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { ReportCardFilters, Store } from '../db/store.js';
import { resolveSchoolYear } from '../lib/access.js';
import { asyncHandler } from '../lib/async.js';
import { HttpError } from '../lib/errors.js';
import { requireId, requireTrimester } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { buildReportCardDetail, type ReportCardDetail } from '../services/report-card.js';

export function reportCardsRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin', 'teacher'));

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const status = req.query['status'];
      const filter = {
        classId: req.query['classId'] ? requireId(req.query['classId'], 'classId') : undefined,
        studentId: req.query['studentId'] ? requireId(req.query['studentId'], 'studentId') : undefined,
        trimester: req.query['trimester'] ? requireTrimester(req.query['trimester']) : undefined,
        status: status === 'draft' || status === 'published' ? status : undefined,
        schoolYearId: req.query['schoolYearId'] ? requireId(req.query['schoolYearId'], 'schoolYearId') : undefined,
      } satisfies ReportCardFilters;
      const rows = await store.listReportCards(filter);
      const details: ReportCardDetail[] = [];
      for (const row of rows) {
        details.push(
          await buildReportCardDetail(store, {
            studentId: row.student_id,
            schoolYearId: row.school_year_id,
            trimester: row.trimester,
            reportCard: row,
          }),
        );
      }
      res.json({ reportCards: details });
    }),
  );

  // Génère (ou régénère) les bulletins brouillon d'une classe pour un trimestre.
  router.post(
    '/generate',
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const classId = requireId(req.body?.classId, 'classId');
      const trimester = requireTrimester(req.body?.trimester);
      const schoolYear = await resolveSchoolYear(
        store,
        req.body?.schoolYearId == null ? undefined : requireId(req.body.schoolYearId, 'schoolYearId'),
      );

      if (!(await store.getClass(classId))) throw HttpError.badRequest('Classe introuvable');

      if (user.role === 'teacher') {
        const assignments = await store.listAssignments({ classId });
        if (!assignments.some((a) => a.teacher_id === user.id)) {
          throw HttpError.forbidden("Vous n'enseignez pas dans cette classe");
        }
      }

      const students = await store.listStudents({ classId });
      const details: ReportCardDetail[] = [];
      for (const student of students) {
        if (!(await store.studentHasNotes(student.id, schoolYear.id, trimester))) continue;
        const reportCard = await store.upsertReportCard(student.id, schoolYear.id, trimester);
        details.push(
          await buildReportCardDetail(store, {
            studentId: student.id,
            schoolYearId: schoolYear.id,
            trimester,
            reportCard,
          }),
        );
      }
      res.json({ reportCards: details });
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const reportCard = await store.getReportCardById(requireId(req.params['id']));
      if (!reportCard) throw HttpError.notFound('Bulletin introuvable');
      const detail = await buildReportCardDetail(store, {
        studentId: reportCard.student_id,
        schoolYearId: reportCard.school_year_id,
        trimester: reportCard.trimester,
        reportCard,
      });
      res.json({ reportCard: detail });
    }),
  );

  // Publication réservée à l'administrateur.
  router.post(
    '/:id/publish',
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const user = req.user as NonNullable<typeof req.user>;
      const id = requireId(req.params['id']);
      const existing = await store.getReportCardById(id);
      if (!existing) throw HttpError.notFound('Bulletin introuvable');

      const published = await store.publishReportCard(id, user.id);
      const detail = await buildReportCardDetail(store, {
        studentId: (published as NonNullable<typeof published>).student_id,
        schoolYearId: (published as NonNullable<typeof published>).school_year_id,
        trimester: (published as NonNullable<typeof published>).trimester,
        reportCard: published,
      });
      res.json({ reportCard: detail });
    }),
  );

  return router;
}
