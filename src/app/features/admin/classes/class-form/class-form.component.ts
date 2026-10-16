import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClassService } from '../../../../core/services/class.service';
import { SchoolClass } from '../../../../core/models/class.model';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './class-form.component.html',
  styleUrl: './class-form.component.scss',
})
export class ClassFormComponent implements OnInit {
  @Input() classData: SchoolClass | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private classService = inject(ClassService);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    level: [''],
    school_year: ['2024-2025', Validators.required],
  });

  ngOnInit() {
    if (this.classData) {
      this.form.patchValue({
        name: this.classData.name,
        level: this.classData.level || '',
        school_year: this.classData.school_year,
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as SchoolClass;
    const obs = this.classData?.id
      ? this.classService.update(this.classData.id, data)
      : this.classService.create(data);
    obs.subscribe({
      next: () => { this.saving.set(false); this.saved.emit(); },
      error: (e) => { this.error.set(e.error?.error || 'Erreur'); this.saving.set(false); },
    });
  }

  cancel() { this.cancelled.emit(); }
}
