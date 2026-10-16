import { Router } from 'express';
import type { AppConfig } from '../config.js';
import type { Store } from '../db/store.js';
import { resolveSchoolYear } from '../lib/access.js';
import { asyncHandler } from '../lib/async.js';
import { round2 } from '../lib/calc.js';
import { requireId, requireTrimester } from '../lib/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function dashboardRouter({ store, config }: { store: Store; config: AppConfig }): Router {
  const router = Router();
  const auth = requireAuth({ jwtSecret: config.jwtSecret, findUserById: (id) => store.findUserById(id) });
  router.use(auth, requireRole('admin', 'teacher'));

  router.get(
    '/stats',
    asyncHandler(async (req, res) => {
      const schoolYear = await resolveSchoolYear(
        store,
        req.query['schoolYearId'] ? requireId(req.query['schoolYearId'], 'schoolYearId') : undefined,
      );
      const trimester = req.query['trimester'] ? requireTrimester(req.query['trimester']) : 1;

      const [teachers, classes, subjects, notes, reportCards] = await Promise.all([
        store.listUsers('teacher'),
        store.listClasses(),
        store.listSubjects(),
        store.listNotes({ schoolYearId: schoolYear.id, trimester }, 1, 0),
        store.listReportCards({ schoolYearId: schoolYear.id }),
      ]);

      const classAverages = await Promise.all(
        classes.map(async (klass) => {
          const students = await store.getClassStudentAverages(klass.id, schoolYear.id, trimester);
          const averages = students.map((s) => Number(s.general_average));
          const generalAverage =
            averages.length > 0 ? round2(averages.reduce((sum, a) => sum + a, 0) / averages.length) : null;
          return {
            classId: klass.id,
            className: klass.name,
            studentCount: students.length,
            generalAverage,
          };
        }),
      );

      res.json({
        schoolYearId: schoolYear.id,
        trimester,
        counts: {
          students: (await store.listStudents({})).length,
          teachers: teachers.length,
          classes: classes.length,
          subjects: subjects.length,
          notes: notes.total,
          reportCards: reportCards.length,
          published: reportCards.filter((r) => r.status === 'published').length,
        },
        classAverages,
      });
    }),
  );

  return router;
}
