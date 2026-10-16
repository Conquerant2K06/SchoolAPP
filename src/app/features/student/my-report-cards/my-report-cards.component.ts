import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardService } from '../../../core/services/report-card.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportCard } from '../../../core/models/report-card.model';

@Component({
  selector: 'app-my-report-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>📄 Mes bulletins</h1>

      @if (loading()) {
        <div class="loading">Chargement...</div>
      } @else if (reports().length === 0) {
        <div class="empty">Aucun bulletin disponible.</div>
      } @else {
        @for (rc of reports(); track rc.id) {
          <div class="report-card">
            <div class="header">
              <div>
                <h2>Trimestre {{ rc.trimester }}</h2>
                <p>{{ rc.school_year }} · {{ rc.class_name }}</p>
              </div>
              <div class="badge-avg">{{ rc.general_average }}/20</div>
            </div>
            <div class="stats">
              <div><span>Rang</span><strong>{{ rc.rank }}</strong></div>
              <div><span>Appréciation</span><strong>{{ rc.appreciation }}</strong></div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { padding: 0; }
    h1 { margin: 0 0 1.5rem; color: #1e293b; }
    .report-card {
      background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; margin-bottom: 1rem;
      h2 { margin: 0; color: #1e293b; }
      p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.85rem; }
    }
    .badge-avg {
      background: #667eea; color: white; padding: 0.75rem 1.25rem;
      border-radius: 10px; font-weight: 700; font-size: 1.3rem;
    }
    .stats { display: flex; gap: 2rem; }
    .stats > div {
      display: flex; flex-direction: column;
      span { color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
      strong { font-size: 1.1rem; color: #1e293b; margin-top: 0.25rem; }
    }
    .loading, .empty { padding: 3rem; text-align: center; color: #64748b; background: white; border-radius: 12px; }
  `]
})
export class MyReportCardsComponent implements OnInit {
  private rcService = inject(ReportCardService);
  private auth = inject(AuthService);
  reports = signal<ReportCard[]>([]);
  loading = signal(false);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;
    this.loading.set(true);
    this.rcService.getAll({ studentId: user.id }).subscribe({
      next: (d) => { this.reports.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
