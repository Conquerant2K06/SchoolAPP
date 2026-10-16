import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StatsService } from '../../../core/services/stats.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash">
      <h1>🎓 Mon espace élève</h1>
      <p class="subtitle">Bienvenue {{ user()?.displayName || user()?.email }}</p>

      @if (loading()) {
        <div class="loading">Chargement...</div>
      } @else {
        <div class="cards">
          <div class="stat-card blue">
            <div class="stat-icon">📊</div>
            <div>
              <div class="stat-value">{{ stats()?.general_average || '0.00' }}/20</div>
              <div class="stat-label">Ma moyenne générale</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">📚</div>
            <div>
              <div class="stat-value">{{ stats()?.by_subject?.length || 0 }}</div>
              <div class="stat-label">Matières notées</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3>📖 Mes moyennes par matière</h3>
          @if (!stats()?.by_subject || stats()!.by_subject.length === 0) {
            <p class="empty">Aucune note pour l'instant. Consultez vos bulletins.</p>
          } @else {
            <div class="subject-list">
              @for (s of stats()!.by_subject; track s.subject_name) {
                <div class="subject-row">
                  <span class="subject-name">{{ s.subject_name }}</span>
                  <div class="bar">
                    <div class="bar-fill" [style.width.%]="(parseFloat(s.average) / 20) * 100"></div>
                  </div>
                  <span class="subject-avg">{{ s.average }}/20</span>
                </div>
              }
            </div>
          }
        </div>

        <div class="quick-links">
          <a routerLink="/student/grades" class="quick-card">
            <span class="quick-icon">📝</span>
            <span class="quick-label">Mes notes</span>
          </a>
          <a routerLink="/student/report-cards" class="quick-card">
            <span class="quick-icon">📄</span>
            <span class="quick-label">Mes bulletins</span>
          </a>
        </div>
      }
    </div>
  `,
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private statsService = inject(StatsService);
  user = this.auth.currentUser;
  stats = signal<any | null>(null);
  loading = signal(false);

  ngOnInit() {
    const u = this.auth.currentUser();
    if (!u) return;
    this.loading.set(true);
    this.statsService.getStudentStats(u.id).subscribe({
      next: (d) => { this.stats.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  parseFloat(v: string): number { return parseFloat(v) || 0; }
}
