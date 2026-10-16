import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassService } from '../../../../core/services/class.service';
import { SchoolClass } from '../../../../core/models/class.model';
import { ClassFormComponent } from '../class-form/class-form.component';

@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [CommonModule, ClassFormComponent],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.scss',
})
export class ClassesListComponent implements OnInit {
  private classService = inject(ClassService);
  classes = signal<SchoolClass[]>([]);
  loading = signal(false);
  showForm = signal(false);
  editingClass = signal<SchoolClass | null>(null);
  deleteConfirm = signal<SchoolClass | null>(null);

  ngOnInit() { this.loadClasses(); }

  loadClasses() {
    this.loading.set(true);
    this.classService.getAll().subscribe({
      next: (d) => { this.classes.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.editingClass.set(null); this.showForm.set(true); }
  openEdit(c: SchoolClass) { this.editingClass.set(c); this.showForm.set(true); }
  onFormSaved() { this.showForm.set(false); this.editingClass.set(null); this.loadClasses(); }
  onFormCancel() { this.showForm.set(false); this.editingClass.set(null); }
  confirmDelete(c: SchoolClass) { this.deleteConfirm.set(c); }
  cancelDelete() { this.deleteConfirm.set(null); }
  deleteClass() {
    const c = this.deleteConfirm();
    if (!c?.id) return;
    this.classService.delete(c.id).subscribe(() => {
      this.deleteConfirm.set(null);
      this.loadClasses();
    });
  }
}
