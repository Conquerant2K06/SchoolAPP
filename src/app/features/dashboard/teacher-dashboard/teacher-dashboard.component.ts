import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { GradeService } from '../../../core/services/grade.service';
import { Grade } from '../../../core/models/grade.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash">
      <h1>👨‍🏫 Tableau de bord Enseignant</h1>
      <p class="subtitle">Bienvenue {{ user()?.displayName || user()?.email }}</p>

      @if (loading()) {
        <div class="loading">Chargement...</div>
      } @else {
        <div class="cards">
          <div class="stat-card blue">
            <div class="stat-icon">📝</div>
            <div>
              <div class="stat-value">{{ grades().length }}</div>
              <div class="stat-label">Notes saisies</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">📊</div>
            <div>
              <div class="stat-value">{{ average() }}/20</div>
              <div class="stat-label">Moyenne des notes</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">⚠️</div>
            <div>
              <div class="stat-value">{{ struggling().length }}</div>
              <div class="stat-label">Élèves en difficulté</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <h3>📚 Moyennes par matière</h3>
            @if (bySubject().length === 0) {
              <p class="empty">Aucune note saisie.</p>
            } @else {
              <div class="subject-list">
                @for (s of bySubject(); track s.name) {
                  <div class="subject-row">
                    <span class="subject-name">{{ s.name }}</span>
                    <span class="subject-count">({{ s.count }} notes)</span>
                    <span class="subject-avg">{{ s.avg }}/20</span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="panel">
            <h3>⚠️ Élèves en difficulté (&lt; 10/20)</h3>
            @if (struggling().length === 0) {
              <p class="empty">Aucun élève en difficulté. 🎉</p>
            } @else {
              <ul class="struggling-list">
                @for (s of struggling(); track s.student_id) {
                  <li>
                    <span>{{ s.name }}</span>
                    <strong>{{ s.avg }}/20</strong>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private gradeService = inject(GradeService);
  user = this.auth.currentUser;
  grades = signal<Grade[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    // Charge toutes les notes visibles (le backend filtrera par enseignant dans une version plus poussée)
    this.gradeService.getAll().subscribe({
      next: (d) => { this.grades.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  average(): string {
    const g = this.grades().filter(x => x.value != null);
    if (g.length === 0) return '0.00';
    return (g.reduce((a, x) => a + Number(x.value), 0) / g.length).toFixed(2);
  }

  bySubject() {
    const map = new Map<string, { name: string; sum: number; count: number; avg: string }>();
    this.grades().forEach(g => {
      const key = g.subject_name || 'Inconnue';
      const cur = map.get(key) || { name: key, sum: 0, count: 0, avg: '0.00' };
      cur.sum += Number(g.value);
      cur.count += 1;
      cur.avg = (cur.sum / cur.count).toFixed(2);
      map.set(key, cur);
    });
    return Array.from(map.values());
  }

  struggling() {
    const map = new Map<number, { student_id: number; name: string; sum: number; count: number; avg: string }>();
    this.grades().forEach(g => {
      const key = g.student_id;
      const cur = map.get(key) || {
        student_id: key,
        name: `${g.student_first_name} ${g.student_last_name}`,
        sum: 0, count: 0, avg: '0.00'
      };
      cur.sum += Number(g.value);
      cur.count += 1;
      cur.avg = (cur.sum / cur.count).toFixed(2);
      map.set(key, cur);
    });
    return Array.from(map.values()).filter(s => parseFloat(s.avg) < 10);
  }
}
