import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grade } from '../models/grade.model';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/grades`;

  getAll(params?: { studentId?: number; subjectId?: number; classId?: number; trimester?: number }): Observable<Grade[]> {
    let url = this.API;
    const q: string[] = [];
    if (params?.studentId) q.push(`studentId=${params.studentId}`);
    if (params?.subjectId) q.push(`subjectId=${params.subjectId}`);
    if (params?.classId) q.push(`classId=${params.classId}`);
    if (params?.trimester) q.push(`trimester=${params.trimester}`);
    if (q.length) url += '?' + q.join('&');
    return this.http.get<Grade[]>(url);
  }

  create(grade: Grade): Observable<Grade> {
    return this.http.post<Grade>(this.API, grade);
  }

  createBulk(grades: Grade[]): Observable<any> {
    return this.http.post(`${this.API}/bulk`, { grades });
  }

  update(id: number, grade: Partial<Grade>): Observable<Grade> {
    return this.http.put<Grade>(`${this.API}/${id}`, grade);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
