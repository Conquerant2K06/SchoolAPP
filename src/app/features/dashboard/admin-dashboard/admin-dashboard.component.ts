import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, AdminStats } from '../../../core/services/stats.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash">
      <h1>🛡️ Tableau de bord Administrateur</h1>
      <p class="subtitle">Vue d'ensemble de l'établissement</p>

      @if (loading()) {
        <div class="loading">Chargement...</div>
      } @else if (stats()) {
        <div class="cards">
          <div class="stat-card blue">
            <div class="stat-icon">👨‍🎓</div>
            <div>
              <div class="stat-value">{{ stats()!.counts.students }}</div>
              <div class="stat-label">Élèves</div>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon">👨‍🏫</div>
            <div>
              <div class="stat-value">{{ stats()!.counts.teachers }}</div>
              <div class="stat-label">Enseignants</div>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">🏫</div>
            <div>
              <div class="stat-value">{{ stats()!.counts.classes }}</div>
              <div class="stat-label">Classes</div>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">📚</div>
            <div>
              <div class="stat-value">{{ stats()!.counts.subjects }}</div>
              <div class="stat-label">Matières</div>
            </div>
          </div>
          <div class="stat-card teal">
            <div class="stat-icon">📝</div>
            <div>
              <div class="stat-value">{{ stats()!.counts.grades }}</div>
              <div class="stat-label">Notes saisies</div>
            </div>
          </div>
          <div class="stat-card red">
            <div class="stat-icon">🎯</div>
            <div>
              <div class="stat-value">{{ stats()!.general_average }}/20</div>
              <div class="stat-label">Moyenne générale</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="panel">
            <h3>🏆 Top 10 élèves</h3>
            @if (stats()!.top_students.length === 0) {
              <p class="empty">Aucun élève noté pour l'instant.</p>
            } @else {
              <ol class="top-list">
                @for (s of stats()!.top_students; track s.id; let i = $index) {
                  <li>
                    <span class="rank">{{ i + 1 }}</span>
                    <span class="name">{{ s.first_name }} {{ s.last_name }}</span>
                    <span class="avg">{{ s.average }}/20</span>
                  </li>
                }
              </ol>
            }
          </div>

          <div class="panel">
            <h3>📊 Répartition des mentions</h3>
            @if (stats()!.mention_distribution.length === 0) {
              <p class="empty">Aucune donnée.</p>
            } @else {
              <div class="mentions">
                @for (m of stats()!.mention_distribution; track m.mention) {
                  <div class="mention-row">
                    <span class="mention-label">{{ m.mention }}</span>
                    <div class="bar">
                      <div class="bar-fill" [style.width.%]="getBarWidth(m.count)"></div>
                    </div>
                    <span class="mention-count">{{ m.count }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  stats = signal<AdminStats | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.statsService.getAdminStats().subscribe({
      next: (d) => { this.stats.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getBarWidth(count: string): number {
    const max = Math.max(...this.stats()!.mention_distribution.map(m => parseInt(m.count)));
    return max > 0 ? (parseInt(count) / max) * 100 : 0;
  }
}
