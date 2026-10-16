import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TeacherService } from '../../../../core/services/teacher.service';
import { Teacher } from '../../../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.scss',
})
export class TeacherFormComponent implements OnInit {
  @Input() teacher: Teacher | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: [''],
  });

  ngOnInit() {
    if (this.teacher) {
      this.form.patchValue({
        first_name: this.teacher.first_name,
        last_name: this.teacher.last_name,
        email: this.teacher.email || '',
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const data = this.form.value as Teacher;

    const obs = this.teacher?.id
      ? this.teacherService.update(this.teacher.id, data)
      : this.teacherService.create(data);

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