import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReportCardService } from '../../../core/services/report-card.service';
import { StudentService } from '../../../core/services/student.service';
import { ReportCard } from '../../../core/models/report-card.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-report-cards-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-cards-admin.component.html',
  styleUrl: './report-cards-admin.component.scss',
})
export class ReportCardsAdminComponent implements OnInit {
  private rcService = inject(ReportCardService);
  private studentService = inject(StudentService);
  private fb = inject(FormBuilder);

  reports = signal<ReportCard[]>([]);
  students = signal<Student[]>([]);
  loading = signal(false);
  generating = signal(false);
  showModal = signal(false);
  successMessage = signal<string | null>(null);

  form = this.fb.group({
    student_id: [null as number | null, Validators.required],
    trimester: [1, Validators.required],
    school_year: ['2024-2025', Validators.required],
  });

  ngOnInit() {
    this.load();
    this.studentService.getAll().subscribe((d) => this.students.set(d));
  }

  load() {
    this.loading.set(true);
    this.rcService.getAll().subscribe({
      next: (d) => { this.reports.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() {
    this.form.reset({ student_id: null, trimester: 1, school_year: '2024-2025' });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  generate() {
    if (this.form.invalid) return;
    this.generating.set(true);
    const { student_id, trimester, school_year } = this.form.value;
    this.rcService.generate(student_id!, trimester!, school_year!).subscribe({
      next: (res) => {
        this.generating.set(false);
        this.showModal.set(false);
        this.successMessage.set(`✅ Bulletin généré : moyenne ${res.report_card.general_average}/20, rang ${res.report_card.rank}, mention "${res.report_card.appreciation}"`);
        this.load();
        setTimeout(() => this.successMessage.set(null), 6000);
      },
      error: (err) => {
        this.generating.set(false);
        alert(err.error?.error || 'Erreur');
      },
    });
  }
}
