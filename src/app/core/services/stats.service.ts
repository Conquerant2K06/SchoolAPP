import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  counts: { students: number; teachers: number; classes: number; subjects: number; grades: number };
  general_average: string;
  top_students: { id: number; first_name: string; last_name: string; average: string }[];
  mention_distribution: { mention: string; count: string }[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/stats`;

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API}/admin`);
  }

  getTeacherStats(teacherId: number): Observable<any> {
    return this.http.get(`${this.API}/teacher?teacherId=${teacherId}`);
  }

  getStudentStats(studentId: number): Observable<any> {
    return this.http.get(`${this.API}/student?studentId=${studentId}`);
  }
}
