import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { Student } from '../../../../core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss',
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: [''],
    class_id: [null as number | null],
  });

  ngOnInit() {
    if (this.student) {
      this.form.patchValue({
        first_name: this.student.first_name,
        last_name: this.student.last_name,
        email: this.student.email || '',
        class_id: this.student.class_id || null,
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const data = this.form.value as Student;

    const obs = this.student?.id
      ? this.studentService.update(this.student.id, data)
      : this.studentService.create(data);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Erreur');
        this.saving.set(false);
      },
    });
  }

  cancel() {
    this.cancelled.emit();
  }
}
