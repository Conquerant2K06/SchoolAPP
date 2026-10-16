import type { ReportCardRow, Store } from '../db/store.js';
import { appreciation, competitionRanks, generalAverage } from '../lib/calc.js';
import { HttpError } from '../lib/errors.js';

export interface SubjectLine {
  subjectId: number;
  subjectName: string;
  coefficient: number;
  average: number;
  appreciation: string;
}

export interface ReportCardDetail {
  id: number | null;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  studentId: number;
  studentName: string;
  classId: number | null;
  className: string | null;
  schoolYearId: number;
  trimester: number;
  subjects: SubjectLine[];
  generalAverage: number | null;
  appreciation: string | null;
  rank: number | null;
  classSize: number;
}

/**
 * Construit le détail d'un bulletin à la demande : moyennes par matière,
 * moyenne générale, appréciation et rang (compétition).
 */
export async function buildReportCardDetail(
  store: Store,
  input: { studentId: number; schoolYearId: number; trimester: number; reportCard?: ReportCardRow | null },
): Promise<ReportCardDetail> {
  const student = await store.findUserById(input.studentId);
  if (!student || student.role !== 'student') {
    throw HttpError.notFound('Élève introuvable');
  }

  const subjectRows = await store.getStudentSubjectAverages(input.studentId, input.schoolYearId, input.trimester);
  const subjects: SubjectLine[] = subjectRows.map((row) => {
    const avg = Number(row.average);
    return {
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      coefficient: row.subject_coefficient,
      average: avg,
      appreciation: appreciation(avg),
    };
  });

  const moyGeneral = generalAverage(
    subjects.map((s) => ({ coefficient: s.coefficient, average: s.average })),
  );

  let rank: number | null = null;
  let classSize = 0;
  if (student.class_id != null) {
    const peers = await store.getClassStudentAverages(student.class_id, input.schoolYearId, input.trimester);
    const averages = peers.map((p) => Number(p.general_average));
    const ranks = competitionRanks(averages);
    classSize = peers.length;
    const index = peers.findIndex((p) => p.student_id === input.studentId);
    rank = index >= 0 ? (ranks[index] ?? null) : null;
  }

  const klass = student.class_id != null ? await store.getClass(student.class_id) : null;

  return {
    id: input.reportCard?.id ?? null,
    status: input.reportCard?.status ?? 'draft',
    publishedAt: input.reportCard?.published_at ?? null,
    studentId: student.id,
    studentName: student.full_name,
    classId: student.class_id,
    className: klass?.name ?? null,
    schoolYearId: input.schoolYearId,
    trimester: input.trimester,
    subjects,
    generalAverage: moyGeneral,
    appreciation: moyGeneral == null ? null : appreciation(moyGeneral),
    rank,
    classSize,
  };
}
