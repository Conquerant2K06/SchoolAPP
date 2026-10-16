import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeService } from '../../../core/services/grade.service';
import { AuthService } from '../../../core/services/auth.service';
import { Grade } from '../../../core/models/grade.model';

@Component({
  selector: 'app-my-grades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>📝 Mes notes</h1>

      @if (loading()) {
        <div class="loading">Chargement...</div>
      } @else if (grades().length === 0) {
        <div class="empty">Aucune note pour l'instant.</div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              <th>Matière</th>
              <th>Type</th>
              <th>Note</th>
              <th>Coefficient</th>
              <th>Trimestre</th>
            </tr>
          </thead>
          <tbody>
            @for (g of grades(); track g.id) {
              <tr>
                <td><strong>{{ g.subject_name }}</strong></td>
                <td>{{ g.type }}</td>
                <td class="value">{{ g.value }}/20</td>
                <td>{{ g.coefficient }}</td>
                <td>T{{ g.trimester }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .page { padding: 0; }
    h1 { margin: 0 0 1.5rem; color: #1e293b; }
    .data-table {
      width: 100%; border-collapse: collapse; background: white; border-radius: 12px;
      overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      th, td { padding: 0.85rem 1rem; text-align: left; font-size: 0.9rem; }
      th { background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
      tbody tr { border-top: 1px solid #f1f5f9; }
      .value { font-weight: 700; color: #667eea; }
    }
    .loading, .empty { padding: 3rem; text-align: center; color: #64748b; background: white; border-radius: 12px; }
  `]
})
export class MyGradesComponent implements OnInit {
  private gradeService = inject(GradeService);
  private auth = inject(AuthService);
  grades = signal<Grade[]>([]);
  loading = signal(false);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;
    this.loading.set(true);
    this.gradeService.getAll({ studentId: user.id }).subscribe({
      next: (d) => { this.grades.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
