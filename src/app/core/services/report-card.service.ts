import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportCard, ReportCardGenerationResult } from '../models/report-card.model';

@Injectable({ providedIn: 'root' })
export class ReportCardService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/report-cards`;

  getAll(params?: { studentId?: number; classId?: number; trimester?: number }): Observable<ReportCard[]> {
    let url = this.API;
    const q: string[] = [];
    if (params?.studentId) q.push(`studentId=${params.studentId}`);
    if (params?.classId) q.push(`classId=${params.classId}`);
    if (params?.trimester) q.push(`trimester=${params.trimester}`);
    if (q.length) url += '?' + q.join('&');
    return this.http.get<ReportCard[]>(url);
  }

  generate(student_id: number, trimester: number, school_year: string): Observable<ReportCardGenerationResult> {
    return this.http.post<ReportCardGenerationResult>(`${this.API}/generate`, {
      student_id,
      trimester,
      school_year,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
