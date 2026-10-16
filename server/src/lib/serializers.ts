import type { ClassRow, NoteRow, NoteWithStudentRow, SubjectRow, UserRow, UserWithClassRow } from '../db/store.js';

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: UserRow['role'];
  active: boolean;
  classId: number | null;
  classId2?: never;
}

export function toUserDto(user: UserRow): UserDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    active: user.active,
    classId: user.class_id,
  };
}

export function toUserWithClassDto(user: UserWithClassRow) {
  return { ...toUserDto(user), className: user.class_name };
}

export function toClassDto(row: ClassRow) {
  return { id: row.id, name: row.name, level: row.level };
}

export function toSubjectDto(row: SubjectRow) {
  return { id: row.id, name: row.name, code: row.code, coefficient: row.coefficient };
}

export function toNoteDto(row: NoteRow | NoteWithStudentRow) {
  const withNames = row as NoteWithStudentRow;
  return {
    id: row.id,
    studentId: row.student_id,
    subjectId: row.subject_id,
    classId: row.class_id,
    schoolYearId: row.school_year_id,
    trimester: row.trimester,
    value: Number(row.value),
    coefficient: row.coefficient,
    studentName: withNames.student_name,
    subjectName: withNames.subject_name,
  };
}
