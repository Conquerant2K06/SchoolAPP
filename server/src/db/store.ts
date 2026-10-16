import type { Pool, PoolClient } from 'pg';
import type { Role } from '../config.js';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: Role;
  active: boolean;
  class_id: number | null;
  created_at: Date;
}

export interface ClassRow {
  id: number;
  name: string;
  level: string | null;
  created_at: Date;
}

export interface SubjectRow {
  id: number;
  name: string;
  code: string;
  coefficient: number;
  created_at: Date;
}

export interface SchoolYearRow {
  id: number;
  label: string;
  active: boolean;
  created_at: Date;
}

export interface TrimesterRow {
  id: number;
  school_year_id: number;
  number: number;
}

export interface AssignmentRow {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
}

export interface NoteRow {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  school_year_id: number;
  trimester: number;
  value: string;
  coefficient: number;
  created_at: Date;
}

export interface ReportCardRow {
  id: number;
  student_id: number;
  school_year_id: number;
  trimester: number;
  status: 'draft' | 'published';
  published_by: number | null;
  published_at: Date | null;
  created_at: Date;
}

export interface SubjectAverageRow {
  subject_id: number;
  subject_name: string;
  subject_coefficient: number;
  average: string;
}

export interface StudentAverageRow {
  student_id: number;
  full_name: string;
  class_id: number;
  class_name: string;
  general_average: string;
}

export interface UserWithClassRow extends UserRow {
  class_name: string | null;
}

export interface NoteWithStudentRow extends NoteRow {
  student_name: string;
  subject_name: string;
}

export interface NoteFilters {
  classId?: number;
  subjectId?: number;
  studentId?: number;
  trimester?: number;
  schoolYearId?: number;
  teacherId?: number;
}

export interface ReportCardFilters {
  classId?: number;
  studentId?: number;
  trimester?: number;
  status?: 'draft' | 'published';
  schoolYearId?: number;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  classId?: number | null;
}

/**
 * Contrat d'accès aux données. L'implémentation PostgreSQL est utilisée en
 * exécution ; les tests peuvent fournir une implémentation en mémoire.
 */
export interface Store {
  // Utilisateurs
  findUserByEmail(email: string): Promise<UserRow | null>;
  findUserById(id: number): Promise<UserRow | null>;
  createUser(input: CreateUserInput): Promise<UserRow>;
  listUsers(role?: Role): Promise<UserWithClassRow[]>;
  listStudents(filter: { name?: string; classId?: number; schoolYearId?: number }): Promise<UserWithClassRow[]>;
  setUserActive(id: number, active: boolean): Promise<UserRow | null>;
  updateStudentClass(id: number, classId: number | null): Promise<UserRow | null>;
  updateUser(
    id: number,
    input: { fullName: string; classId: number | null; active: boolean },
  ): Promise<UserRow | null>;

  // Classes
  listClasses(): Promise<ClassRow[]>;
  getClass(id: number): Promise<ClassRow | null>;
  createClass(input: { name: string; level: string | null }): Promise<ClassRow>;
  updateClass(id: number, input: { name: string; level: string | null }): Promise<ClassRow | null>;
  deleteClass(id: number): Promise<boolean>;
  countStudentsInClass(classId: number): Promise<number>;

  // Matières
  listSubjects(): Promise<SubjectRow[]>;
  getSubject(id: number): Promise<SubjectRow | null>;
  findSubjectByCode(code: string): Promise<SubjectRow | null>;
  createSubject(input: { name: string; code: string; coefficient: number }): Promise<SubjectRow>;
  updateSubject(id: number, input: { name: string; code: string; coefficient: number }): Promise<SubjectRow | null>;
  deleteSubject(id: number): Promise<boolean>;

  // Années scolaires
  listSchoolYears(): Promise<SchoolYearRow[]>;
  getSchoolYear(id: number): Promise<SchoolYearRow | null>;
  getActiveSchoolYear(): Promise<SchoolYearRow | null>;
  createSchoolYear(label: string, activate: boolean): Promise<SchoolYearRow>;
  setActiveSchoolYear(id: number): Promise<SchoolYearRow | null>;
  listTrimesters(schoolYearId: number): Promise<TrimesterRow[]>;

  // Affectations
  listAssignments(filter: { teacherId?: number; classId?: number; subjectId?: number }): Promise<AssignmentRow[]>;
  getAssignment(id: number): Promise<AssignmentRow | null>;
  createAssignment(input: { teacherId: number; subjectId: number; classId: number }): Promise<AssignmentRow>;
  deleteAssignment(id: number): Promise<boolean>;
  teacherHasAssignment(teacherId: number, subjectId: number, classId: number): Promise<boolean>;

  // Notes
  listNotes(filter: NoteFilters, limit: number, offset: number): Promise<{ rows: NoteWithStudentRow[]; total: number }>;
  getNote(id: number): Promise<NoteRow | null>;
  createNote(input: {
    studentId: number;
    subjectId: number;
    classId: number;
    schoolYearId: number;
    trimester: number;
    value: number;
    coefficient: number;
  }): Promise<NoteRow>;
  updateNote(id: number, input: { value: number; coefficient: number }): Promise<NoteRow | null>;
  deleteNote(id: number): Promise<boolean>;
  countNotesByStudent(studentId: number): Promise<number>;

  // Bulletins et calculs
  getStudentSubjectAverages(studentId: number, schoolYearId: number, trimester: number): Promise<SubjectAverageRow[]>;
  getClassStudentAverages(classId: number, schoolYearId: number, trimester: number): Promise<StudentAverageRow[]>;
  getStudentAverages(schoolYearId: number, trimester: number, classIds?: number[]): Promise<StudentAverageRow[]>;
  studentHasNotes(studentId: number, schoolYearId: number, trimester: number): Promise<boolean>;
  getReportCard(studentId: number, schoolYearId: number, trimester: number): Promise<ReportCardRow | null>;
  getReportCardById(id: number): Promise<ReportCardRow | null>;
  upsertReportCard(studentId: number, schoolYearId: number, trimester: number): Promise<ReportCardRow>;
  publishReportCard(id: number, publishedBy: number): Promise<ReportCardRow | null>;
  listReportCards(filter: ReportCardFilters): Promise<(ReportCardRow & { student_name: string; class_id: number | null; class_name: string | null })[]>;
}

export class PgStore implements Store {
  constructor(private readonly pool: Pool) {}

  private async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  }

  async findUserById(id: number): Promise<UserRow | null> {
    const rows = await this.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async createUser(input: CreateUserInput): Promise<UserRow> {
    const rows = await this.query<UserRow>(
      `INSERT INTO users (email, password_hash, full_name, role, class_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [input.email, input.passwordHash, input.fullName, input.role, input.classId ?? null],
    );
    return rows[0] as UserRow;
  }

  async listUsers(role?: Role): Promise<UserWithClassRow[]> {
    return this.query<UserWithClassRow>(
      `SELECT u.*, c.name AS class_name
       FROM users u LEFT JOIN classes c ON c.id = u.class_id
       WHERE ($1::text IS NULL OR u.role = $1)
       ORDER BY u.full_name`,
      [role ?? null],
    );
  }

  async listStudents(filter: { name?: string; classId?: number; schoolYearId?: number }): Promise<UserWithClassRow[]> {
    return this.query<UserWithClassRow>(
      `SELECT u.*, c.name AS class_name
       FROM users u LEFT JOIN classes c ON c.id = u.class_id
       WHERE u.role = 'student'
         AND ($1::text IS NULL OR u.full_name ILIKE '%' || $1 || '%')
         AND ($2::int IS NULL OR u.class_id = $2)
         AND ($3::int IS NULL OR EXISTS (SELECT 1 FROM notes n WHERE n.student_id = u.id AND n.school_year_id = $3))
       ORDER BY u.full_name`,
      [filter.name ?? null, filter.classId ?? null, filter.schoolYearId ?? null],
    );
  }

  async updateUser(
    id: number,
    input: { fullName: string; classId: number | null; active: boolean },
  ): Promise<UserRow | null> {
    const rows = await this.query<UserRow>(
      'UPDATE users SET full_name = $2, class_id = $3, active = $4 WHERE id = $1 RETURNING *',
      [id, input.fullName, input.classId, input.active],
    );
    return rows[0] ?? null;
  }

  async setUserActive(id: number, active: boolean): Promise<UserRow | null> {
    const rows = await this.query<UserRow>('UPDATE users SET active = $2 WHERE id = $1 RETURNING *', [id, active]);
    return rows[0] ?? null;
  }

  async updateStudentClass(id: number, classId: number | null): Promise<UserRow | null> {
    const rows = await this.query<UserRow>('UPDATE users SET class_id = $2 WHERE id = $1 RETURNING *', [id, classId]);
    return rows[0] ?? null;
  }

  async listClasses(): Promise<ClassRow[]> {
    return this.query<ClassRow>('SELECT * FROM classes ORDER BY name');
  }

  async getClass(id: number): Promise<ClassRow | null> {
    const rows = await this.query<ClassRow>('SELECT * FROM classes WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async createClass(input: { name: string; level: string | null }): Promise<ClassRow> {
    const rows = await this.query<ClassRow>('INSERT INTO classes (name, level) VALUES ($1, $2) RETURNING *', [
      input.name,
      input.level,
    ]);
    return rows[0] as ClassRow;
  }

  async updateClass(id: number, input: { name: string; level: string | null }): Promise<ClassRow | null> {
    const rows = await this.query<ClassRow>(
      'UPDATE classes SET name = $2, level = $3 WHERE id = $1 RETURNING *',
      [id, input.name, input.level],
    );
    return rows[0] ?? null;
  }

  async deleteClass(id: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>('DELETE FROM classes WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }

  async countStudentsInClass(classId: number): Promise<number> {
    const rows = await this.query<{ count: string }>(
      "SELECT COUNT(*)::int AS count FROM users WHERE class_id = $1 AND role = 'student'",
      [classId],
    );
    return Number(rows[0]?.count ?? 0);
  }

  async listSubjects(): Promise<SubjectRow[]> {
    return this.query<SubjectRow>('SELECT * FROM subjects ORDER BY name');
  }

  async getSubject(id: number): Promise<SubjectRow | null> {
    const rows = await this.query<SubjectRow>('SELECT * FROM subjects WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async findSubjectByCode(code: string): Promise<SubjectRow | null> {
    const rows = await this.query<SubjectRow>('SELECT * FROM subjects WHERE code = $1', [code]);
    return rows[0] ?? null;
  }

  async createSubject(input: { name: string; code: string; coefficient: number }): Promise<SubjectRow> {
    const rows = await this.query<SubjectRow>(
      'INSERT INTO subjects (name, code, coefficient) VALUES ($1, $2, $3) RETURNING *',
      [input.name, input.code, input.coefficient],
    );
    return rows[0] as SubjectRow;
  }

  async updateSubject(
    id: number,
    input: { name: string; code: string; coefficient: number },
  ): Promise<SubjectRow | null> {
    const rows = await this.query<SubjectRow>(
      'UPDATE subjects SET name = $2, code = $3, coefficient = $4 WHERE id = $1 RETURNING *',
      [id, input.name, input.code, input.coefficient],
    );
    return rows[0] ?? null;
  }

  async deleteSubject(id: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>('DELETE FROM subjects WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }

  async listSchoolYears(): Promise<SchoolYearRow[]> {
    return this.query<SchoolYearRow>('SELECT * FROM school_years ORDER BY label DESC');
  }

  async getSchoolYear(id: number): Promise<SchoolYearRow | null> {
    const rows = await this.query<SchoolYearRow>('SELECT * FROM school_years WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async getActiveSchoolYear(): Promise<SchoolYearRow | null> {
    const rows = await this.query<SchoolYearRow>('SELECT * FROM school_years WHERE active = TRUE LIMIT 1');
    return rows[0] ?? null;
  }

  async createSchoolYear(label: string, activate: boolean): Promise<SchoolYearRow> {
    const client = await this.pool.connect();
    try {
      await (client as PoolClient).query('BEGIN');
      const inserted = await client.query<SchoolYearRow>(
        'INSERT INTO school_years (label, active) VALUES ($1, $2) RETURNING *',
        [label, activate],
      );
      const year = inserted.rows[0] as SchoolYearRow;
      for (const number of [1, 2, 3]) {
        await client.query('INSERT INTO trimesters (school_year_id, number) VALUES ($1, $2)', [year.id, number]);
      }
      if (activate) {
        await client.query('UPDATE school_years SET active = FALSE WHERE id <> $1', [year.id]);
      }
      await client.query('COMMIT');
      return year;
    } catch (error) {
      await (client as PoolClient).query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async setActiveSchoolYear(id: number): Promise<SchoolYearRow | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE school_years SET active = FALSE WHERE id <> $1', [id]);
      const updated = await client.query<SchoolYearRow>('UPDATE school_years SET active = TRUE WHERE id = $1 RETURNING *', [
        id,
      ]);
      await client.query('COMMIT');
      return updated.rows[0] ?? null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listTrimesters(schoolYearId: number): Promise<TrimesterRow[]> {
    return this.query<TrimesterRow>('SELECT * FROM trimesters WHERE school_year_id = $1 ORDER BY number', [
      schoolYearId,
    ]);
  }

  async listAssignments(filter: { teacherId?: number; classId?: number; subjectId?: number }): Promise<AssignmentRow[]> {
    return this.query<AssignmentRow>(
      `SELECT * FROM teacher_assignments
       WHERE ($1::int IS NULL OR teacher_id = $1)
         AND ($2::int IS NULL OR class_id = $2)
         AND ($3::int IS NULL OR subject_id = $3)
       ORDER BY id`,
      [filter.teacherId ?? null, filter.classId ?? null, filter.subjectId ?? null],
    );
  }

  async getAssignment(id: number): Promise<AssignmentRow | null> {
    const rows = await this.query<AssignmentRow>('SELECT * FROM teacher_assignments WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async createAssignment(input: { teacherId: number; subjectId: number; classId: number }): Promise<AssignmentRow> {
    const rows = await this.query<AssignmentRow>(
      `INSERT INTO teacher_assignments (teacher_id, subject_id, class_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (teacher_id, subject_id, class_id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id
       RETURNING *`,
      [input.teacherId, input.subjectId, input.classId],
    );
    return rows[0] as AssignmentRow;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>('DELETE FROM teacher_assignments WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }

  async teacherHasAssignment(teacherId: number, subjectId: number, classId: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>(
      'SELECT id FROM teacher_assignments WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3 LIMIT 1',
      [teacherId, subjectId, classId],
    );
    return rows.length > 0;
  }

  async listNotes(
    filter: NoteFilters,
    limit: number,
    offset: number,
  ): Promise<{ rows: NoteWithStudentRow[]; total: number }> {
    const conditions = [
      '($1::int IS NULL OR n.class_id = $1)',
      '($2::int IS NULL OR n.subject_id = $2)',
      '($3::int IS NULL OR n.student_id = $3)',
      '($4::int IS NULL OR n.trimester = $4)',
      '($5::int IS NULL OR n.school_year_id = $5)',
    ];
    const params = [
      filter.classId ?? null,
      filter.subjectId ?? null,
      filter.studentId ?? null,
      filter.trimester ?? null,
      filter.schoolYearId ?? null,
    ];
    const where = conditions.join(' AND ');
    const baseJoin = `FROM notes n
      JOIN users u ON u.id = n.student_id
      JOIN subjects s ON s.id = n.subject_id`;
    const totalRows = await this.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count ${baseJoin} WHERE ${where}`,
      params,
    );
    const rows = await this.query<NoteWithStudentRow>(
      `SELECT n.*, u.full_name AS student_name, s.name AS subject_name
       ${baseJoin} WHERE ${where}
       ORDER BY n.created_at DESC
       LIMIT $6 OFFSET $7`,
      [...params, limit, offset],
    );
    return { rows, total: Number(totalRows[0]?.count ?? 0) };
  }

  async getNote(id: number): Promise<NoteRow | null> {
    const rows = await this.query<NoteRow>('SELECT * FROM notes WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async createNote(input: {
    studentId: number;
    subjectId: number;
    classId: number;
    schoolYearId: number;
    trimester: number;
    value: number;
    coefficient: number;
  }): Promise<NoteRow> {
    const rows = await this.query<NoteRow>(
      `INSERT INTO notes (student_id, subject_id, class_id, school_year_id, trimester, value, coefficient)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [input.studentId, input.subjectId, input.classId, input.schoolYearId, input.trimester, input.value, input.coefficient],
    );
    return rows[0] as NoteRow;
  }

  async updateNote(id: number, input: { value: number; coefficient: number }): Promise<NoteRow | null> {
    const rows = await this.query<NoteRow>(
      'UPDATE notes SET value = $2, coefficient = $3 WHERE id = $1 RETURNING *',
      [id, input.value, input.coefficient],
    );
    return rows[0] ?? null;
  }

  async deleteNote(id: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }

  async countNotesByStudent(studentId: number): Promise<number> {
    const rows = await this.query<{ count: string }>('SELECT COUNT(*)::int AS count FROM notes WHERE student_id = $1', [
      studentId,
    ]);
    return Number(rows[0]?.count ?? 0);
  }

  async getStudentSubjectAverages(studentId: number, schoolYearId: number, trimester: number): Promise<SubjectAverageRow[]> {
    return this.query<SubjectAverageRow>(
      `SELECT s.id AS subject_id, s.name AS subject_name, s.coefficient AS subject_coefficient,
              ROUND(SUM(n.value * n.coefficient) / SUM(n.coefficient), 2) AS average
       FROM notes n JOIN subjects s ON s.id = n.subject_id
       WHERE n.student_id = $1 AND n.school_year_id = $2 AND n.trimester = $3
       GROUP BY s.id, s.name, s.coefficient
       ORDER BY s.name`,
      [studentId, schoolYearId, trimester],
    );
  }

  async getClassStudentAverages(classId: number, schoolYearId: number, trimester: number): Promise<StudentAverageRow[]> {
    return this.query<StudentAverageRow>(
      `WITH subject_avgs AS (
         SELECT n.student_id, n.subject_id, s.coefficient AS subject_coefficient,
                SUM(n.value * n.coefficient) / SUM(n.coefficient) AS subject_average
         FROM notes n JOIN subjects s ON s.id = n.subject_id
         WHERE n.school_year_id = $2 AND n.trimester = $3
         GROUP BY n.student_id, n.subject_id, s.coefficient
       )
       SELECT u.id AS student_id, u.full_name, u.class_id, c.name AS class_name,
              ROUND(SUM(sa.subject_average * sa.subject_coefficient) / SUM(sa.subject_coefficient), 2) AS general_average
       FROM users u
       JOIN classes c ON c.id = u.class_id
       JOIN subject_avgs sa ON sa.student_id = u.id
       WHERE u.role = 'student' AND u.class_id = $1
       GROUP BY u.id, u.full_name, u.class_id, c.name
       ORDER BY general_average DESC`,
      [classId, schoolYearId, trimester],
    );
  }

  async getStudentAverages(schoolYearId: number, trimester: number, classIds?: number[]): Promise<StudentAverageRow[]> {
    return this.query<StudentAverageRow>(
      `WITH subject_avgs AS (
         SELECT n.student_id, n.subject_id, s.coefficient AS subject_coefficient,
                SUM(n.value * n.coefficient) / SUM(n.coefficient) AS subject_average
         FROM notes n JOIN subjects s ON s.id = n.subject_id
         WHERE n.school_year_id = $1 AND n.trimester = $2
         GROUP BY n.student_id, n.subject_id, s.coefficient
       )
       SELECT u.id AS student_id, u.full_name, u.class_id, c.name AS class_name,
              ROUND(SUM(sa.subject_average * sa.subject_coefficient) / SUM(sa.subject_coefficient), 2) AS general_average
       FROM users u
       JOIN classes c ON c.id = u.class_id
       JOIN subject_avgs sa ON sa.student_id = u.id
       WHERE u.role = 'student' AND ($3::int[] IS NULL OR u.class_id = ANY($3))
       GROUP BY u.id, u.full_name, u.class_id, c.name
       ORDER BY general_average DESC`,
      [schoolYearId, trimester, classIds ?? null],
    );
  }

  async studentHasNotes(studentId: number, schoolYearId: number, trimester: number): Promise<boolean> {
    const rows = await this.query<{ id: number }>(
      'SELECT id FROM notes WHERE student_id = $1 AND school_year_id = $2 AND trimester = $3 LIMIT 1',
      [studentId, schoolYearId, trimester],
    );
    return rows.length > 0;
  }

  async getReportCard(studentId: number, schoolYearId: number, trimester: number): Promise<ReportCardRow | null> {
    const rows = await this.query<ReportCardRow>(
      'SELECT * FROM report_cards WHERE student_id = $1 AND school_year_id = $2 AND trimester = $3',
      [studentId, schoolYearId, trimester],
    );
    return rows[0] ?? null;
  }

  async getReportCardById(id: number): Promise<ReportCardRow | null> {
    const rows = await this.query<ReportCardRow>('SELECT * FROM report_cards WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async upsertReportCard(studentId: number, schoolYearId: number, trimester: number): Promise<ReportCardRow> {
    const rows = await this.query<ReportCardRow>(
      `INSERT INTO report_cards (student_id, school_year_id, trimester, status)
       VALUES ($1, $2, $3, 'draft')
       ON CONFLICT (student_id, school_year_id, trimester)
       DO UPDATE SET student_id = EXCLUDED.student_id
       RETURNING *`,
      [studentId, schoolYearId, trimester],
    );
    return rows[0] as ReportCardRow;
  }

  async publishReportCard(id: number, publishedBy: number): Promise<ReportCardRow | null> {
    const rows = await this.query<ReportCardRow>(
      `UPDATE report_cards SET status = 'published', published_by = $2, published_at = now()
       WHERE id = $1 RETURNING *`,
      [id, publishedBy],
    );
    return rows[0] ?? null;
  }

  async listReportCards(filter: ReportCardFilters): Promise<(ReportCardRow & { student_name: string; class_id: number | null; class_name: string | null })[]> {
    return this.query(
      `SELECT rc.*, u.full_name AS student_name, u.class_id, c.name AS class_name
       FROM report_cards rc
       JOIN users u ON u.id = rc.student_id
       LEFT JOIN classes c ON c.id = u.class_id
       WHERE ($1::int IS NULL OR u.class_id = $1)
         AND ($2::int IS NULL OR rc.student_id = $2)
         AND ($3::int IS NULL OR rc.trimester = $3)
         AND ($4::text IS NULL OR rc.status = $4)
         AND ($5::int IS NULL OR rc.school_year_id = $5)
       ORDER BY u.full_name, rc.trimester`,
      [
        filter.classId ?? null,
        filter.studentId ?? null,
        filter.trimester ?? null,
        filter.status ?? null,
        filter.schoolYearId ?? null,
      ],
    );
  }
}
