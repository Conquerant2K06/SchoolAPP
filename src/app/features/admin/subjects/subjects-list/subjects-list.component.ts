import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectService } from '../../../../core/services/subject.service';
import { Subject } from '../../../../core/models/subject.model';
import { SubjectFormComponent } from '../subject-form/subject-form.component';

@Component({
  selector: 'app-subjects-list',
  standalone: true,
  imports: [CommonModule, SubjectFormComponent],
  templateUrl: './subjects-list.component.html',
  styleUrl: './subjects-list.component.scss',
})
export class SubjectsListComponent implements OnInit {
  private subjectService = inject(SubjectService);
  subjects = signal<Subject[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingSubject = signal<Subject | null>(null);
  deleteConfirm = signal<Subject | null>(null);

  ngOnInit() { this.loadSubjects(); }

  loadSubjects() {
    this.loading.set(true);
    this.subjectService.getAll().subscribe({
      next: (d) => { this.subjects.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.editingSubject.set(null); this.showForm.set(true); }
  openEdit(s: Subject) { this.editingSubject.set(s); this.showForm.set(true); }
  onFormSaved() { this.showForm.set(false); this.editingSubject.set(null); this.loadSubjects(); }
  onFormCancel() { this.showForm.set(false); this.editingSubject.set(null); }
  confirmDelete(s: Subject) { this.deleteConfirm.set(s); }
  cancelDelete() { this.deleteConfirm.set(null); }
  deleteSubject() {
    const s = this.deleteConfirm();
    if (!s?.id) return;
    this.subjectService.delete(s.id).subscribe(() => {
      this.deleteConfirm.set(null);
      this.loadSubjects();
    });
  }
}
