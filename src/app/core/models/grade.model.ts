export interface Grade {
  id?: number;
  student_id: number;
  subject_id: number;
  teacher_id?: number | null;
  class_id?: number | null;
  value: number;
  type: 'controle' | 'devoir' | 'examen';
  coefficient: number;
  date?: string;
  trimester: number;
  student_first_name?: string;
  student_last_name?: string;
  subject_name?: string;
}
