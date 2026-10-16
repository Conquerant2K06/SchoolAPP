import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/students`;

  getAll(params?: { classId?: number; search?: string }): Observable<Student[]> {
    let url = this.API;
    const query: string[] = [];
    if (params?.classId) query.push(`classId=${params.classId}`);
    if (params?.search) query.push(`search=${encodeURIComponent(params.search)}`);
    if (query.length) url += '?' + query.join('&');
    return this.http.get<Student[]>(url);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.API}/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.API, student);
  }

  update(id: number, student: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.API}/${id}`, student);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
