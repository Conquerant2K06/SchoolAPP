import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { SubjectService } from '../../../core/services/subject.service';
import { ClassService } from '../../../core/services/class.service';
import { GradeService } from '../../../core/services/grade.service';
import { Student } from '../../../core/models/student.model';
import { Subject } from '../../../core/models/subject.model';
import { SchoolClass } from '../../../core/models/class.model';
import { Grade } from '../../../core/models/grade.model';

@Component({
  selector: 'app-grade-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './grade-entry.component.html',
  styleUrl: './grade-entry.component.scss',
})
export class GradeEntryComponent implements OnInit {
  private studentService = inject(StudentService);
  private subjectService = inject(SubjectService);
  private classService = inject(ClassService);
  private gradeService = inject(GradeService);

  classes = signal<SchoolClass[]>([]);
  subjects = signal<Subject[]>([]);
  students = signal<Student[]>([]);
  grades = signal<{ [studentId: number]: { value: number | null; type: string; coefficient: number }[] }>({});

  selectedClassId: number | null = null;
  selectedSubjectId: number | null = null;
  selectedTrimester = 1;
  saving = signal(false);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.classService.getAll().subscribe((d) => this.classes.set(d));
    this.subjectService.getAll().subscribe((d) => this.subjects.set(d));
  }

  onClassChange() {
    if (!this.selectedClassId) { this.students.set([]); return; }
    this.studentService.getAll({ classId: this.selectedClassId }).subscribe({
      next: (data) => {
        this.students.set(data);
        this.initGradesRows(data);
      },
    });
  }

  initGradesRows(students: Student[]) {
    const g: any = {};
    students.forEach((s) => {
      g[s.id!] = [
        { value: null, type: 'controle', coefficient: 1 },
        { value: null, type: 'devoir', coefficient: 1 },
        { value: null, type: 'examen', coefficient: 2 },
      ];
    });
    this.grades.set(g);
  }

  addRow(studentId: number) {
    const g = { ...this.grades() };
    g[studentId] = [...g[studentId], { value: null, type: 'controle', coefficient: 1 }];
    this.grades.set(g);
  }

  removeRow(studentId: number, idx: number) {
    const g = { ...this.grades() };
    g[studentId].splice(idx, 1);
    this.grades.set(g);
  }

  getStudentAvg(studentId: number): string {
    const rows = this.grades()[studentId] || [];
    const valid = rows.filter((r) => r.value !== null && r.value !== undefined);
    if (valid.length === 0) return '-';
    const total = valid.reduce((acc, r) => acc + (r.value! * r.coefficient), 0);
    const coefs = valid.reduce((acc, r) => acc + r.coefficient, 0);
    return (total / coefs).toFixed(2);
  }

  saveAll() {
    if (!this.selectedSubjectId || !this.selectedClassId) {
      alert('Sélectionne une classe et une matière');
      return;
    }

    const allGrades: any[] = [];
    const g = this.grades();

    for (const studentIdStr in g) {
      const studentId = parseInt(studentIdStr);
      for (const row of g[studentId]) {
        if (row.value !== null && row.value !== undefined && row.value >= 0 && row.value <= 20) {
          allGrades.push({
            student_id: studentId,
            subject_id: this.selectedSubjectId,
            class_id: this.selectedClassId,
            value: row.value,
            type: row.type,
            coefficient: row.coefficient,
            trimester: this.selectedTrimester,
          });
        }
      }
    }

    if (allGrades.length === 0) {
      alert('Aucune note à enregistrer');
      return;
    }

    this.saving.set(true);
    this.gradeService.createBulk(allGrades).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.successMessage.set(`${res.count} note(s) enregistrée(s) avec succès !`);
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.saving.set(false);
        alert(err.error?.error || 'Erreur lors de l\'enregistrement');
      },
    });
  }
}
