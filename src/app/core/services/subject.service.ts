import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject } from '../models/subject.model';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/subjects`;

  getAll(): Observable<Subject[]> { return this.http.get<Subject[]>(this.API); }
  create(s: Subject): Observable<Subject> { return this.http.post<Subject>(this.API, s); }
  update(id: number, s: Partial<Subject>): Observable<Subject> { return this.http.put<Subject>(`${this.API}/${id}`, s); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.API}/${id}`); }
}
