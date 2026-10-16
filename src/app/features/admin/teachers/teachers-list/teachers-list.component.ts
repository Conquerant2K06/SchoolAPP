import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../../core/services/teacher.service';
import { Teacher } from '../../../../core/models/teacher.model';
import { TeacherFormComponent } from '../teacher-form/teacher-form.component';


@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TeacherFormComponent],
  templateUrl: './teachers-list.component.html',
  styleUrl: './teachers-list.component.scss',
})
export class TeachersListComponent implements OnInit {
  private teacherService = inject(TeacherService);

  teachers = signal<Teacher[]>([]);
  loading = signal(false);
  search = signal('');
  showForm = signal(false);
  editingTeacher = signal<Teacher | null>(null);
  deleteConfirm = signal<Teacher | null>(null);

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.loading.set(true);
    this.teacherService.getAll(this.search() || undefined).subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadTeachers();
  }

  openCreate() {
    this.editingTeacher.set(null);
    this.showForm.set(true);
  }

  openEdit(teacher: Teacher) {
    this.editingTeacher.set(teacher);
    this.showForm.set(true);
  }

  onFormSaved() {
    this.showForm.set(false);
    this.editingTeacher.set(null);
    this.loadTeachers();
  }

  onFormCancel() {
    this.showForm.set(false);
    this.editingTeacher.set(null);
  }

  confirmDelete(teacher: Teacher) {
    this.deleteConfirm.set(teacher);
  }

  cancelDelete() {
    this.deleteConfirm.set(null);
  }

  deleteTeacher() {
    const teacher = this.deleteConfirm();
    if (!teacher?.id) return;
    this.teacherService.delete(teacher.id).subscribe({
      next: () => {
        this.deleteConfirm.set(null);
        this.loadTeachers();
      },
      error: (err) => console.error(err),
    });
  }
}