import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Teacher } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/teachers`;

  getAll(search?: string): Observable<Teacher[]> {
    const url = search ? `${this.API}?search=${encodeURIComponent(search)}` : this.API;
    return this.http.get<Teacher[]>(url);
  }
  create(t: Teacher): Observable<Teacher> { return this.http.post<Teacher>(this.API, t); }
  update(id: number, t: Partial<Teacher>): Observable<Teacher> { return this.http.put<Teacher>(`${this.API}/${id}`, t); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.API}/${id}`); }
}
