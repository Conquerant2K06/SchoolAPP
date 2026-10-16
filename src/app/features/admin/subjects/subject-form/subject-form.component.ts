import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SubjectService } from '../../../../core/services/subject.service';
import { Subject } from '../../../../core/models/subject.model';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.scss',
})
export class SubjectFormComponent implements OnInit {
  @Input() subject: Subject | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private subjectService = inject(SubjectService);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    coefficient: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    if (this.subject) {
      this.form.patchValue({ name: this.subject.name, coefficient: this.subject.coefficient });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as Subject;
    const obs = this.subject?.id
      ? this.subjectService.update(this.subject.id, data)
      : this.subjectService.create(data);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: (e) => { this.error.set(e.error?.error || 'Erreur'); this.saving.set(false); },
    });
  }

  cancel() { this.cancelled.emit(); }
}
