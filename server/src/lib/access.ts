import type { Store, UserRow } from '../db/store.js';
import { HttpError } from './errors.js';

/** Résout l'année scolaire : celle demandée ou l'année active. */
export async function resolveSchoolYear(store: Store, requestedId?: number) {
  if (requestedId != null) {
    const year = await store.getSchoolYear(requestedId);
    if (!year) throw HttpError.badRequest('Année scolaire introuvable');
    return year;
  }
  const active = await store.getActiveSchoolYear();
  if (!active) throw HttpError.badRequest("Aucune année scolaire active n'est définie");
  return active;
}

/**
 * Un enseignant ne peut agir que sur les couples matière/classe qui lui sont
 * affectés. L'administrateur n'est pas restreint.
 */
export async function assertCanManageGrades(
  store: Store,
  user: UserRow,
  subjectId: number,
  classId: number,
): Promise<void> {
  if (user.role === 'admin') return;
  if (user.role !== 'teacher') throw HttpError.forbidden();
  const allowed = await store.teacherHasAssignment(user.id, subjectId, classId);
  if (!allowed) throw HttpError.forbidden("Vous n'enseignez pas cette matière dans cette classe");
}
