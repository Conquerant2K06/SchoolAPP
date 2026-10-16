import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  user = this.auth.currentUser;
  initials = computed(() => {
    const u = this.user();
    return u ? u.email[0].toUpperCase() : '?';
  });

  constructor(private auth: AuthService, private router: Router) {}

  logout() { this.auth.logout(); }
}
