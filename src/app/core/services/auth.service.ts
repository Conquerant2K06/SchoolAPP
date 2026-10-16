import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private readonly TOKEN_KEY = 'school_ci_token';
  private readonly platformId = inject(PLATFORM_ID);

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  register(data: { email: string; password: string; role: string; displayName: string }) {
    return this.http
      .post<AuthResponse>(`${this.API}/auth/register`, data)
      .pipe(tap((res) => this.handleAuth(res)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.API}/auth/login`, { email, password })
      .pipe(tap((res) => this.handleAuth(res)));
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private handleAuth(res: AuthResponse) {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
    }
    this.currentUser.set(res.user ?? null);
  }

  private loadUserFromToken() {
    const token = this.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        displayName: payload.email.split('@')[0],
      });
    } catch {
      this.logout();
    }
  }
}