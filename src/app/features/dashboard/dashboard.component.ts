import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, TeacherDashboardComponent, StudentDashboardComponent],
  template: `
    @switch (role()) {
      @case ('admin') { <app-admin-dashboard /> }
      @case ('teacher') { <app-teacher-dashboard /> }
      @case ('student') { <app-student-dashboard /> }
      @default {
        <div style="padding:2rem;">
          <h1>Bienvenue {{ user()?.displayName || user()?.email }}</h1>
          <p>Rôle : <strong>{{ user()?.role }}</strong></p>
        </div>
      }
    }
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  user = this.auth.currentUser;
  role = computed(() => this.auth.currentUser()?.role);
}
