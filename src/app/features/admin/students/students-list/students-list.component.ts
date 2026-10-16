import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';
import { StudentFormComponent } from '../student-form/student-form.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentFormComponent],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
})
export class StudentsListComponent implements OnInit {
  private studentService = inject(StudentService);

  students = signal<Student[]>([]);
  loading = signal(false);
  search = signal('');
  showForm = signal(false);
  editingStudent = signal<Student | null>(null);
  deleteConfirm = signal<Student | null>(null);

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.studentService.getAll({ search: this.search() || undefined }).subscribe({
      next: (data) => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadStudents();
  }

  openCreate() {
    this.editingStudent.set(null);
    this.showForm.set(true);
  }

  openEdit(student: Student) {
    this.editingStudent.set(student);
    this.showForm.set(true);
  }

  onFormSaved() {
    this.showForm.set(false);
    this.editingStudent.set(null);
    this.loadStudents();
  }

  onFormCancel() {
    this.showForm.set(false);
    this.editingStudent.set(null);
  }

  confirmDelete(student: Student) {
    this.deleteConfirm.set(student);
  }

  cancelDelete() {
    this.deleteConfirm.set(null);
  }

  deleteStudent() {
    const student = this.deleteConfirm();
    if (!student?.id) return;
    this.studentService.delete(student.id).subscribe({
      next: () => {
        this.deleteConfirm.set(null);
        this.loadStudents();
      },
      error: (err) => console.error(err),
    });
  }
}
