import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SchoolClass } from '../models/class.model';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/classes`;

  getAll(): Observable<SchoolClass[]> {
    return this.http.get<SchoolClass[]>(this.API);
  }
  create(c: SchoolClass): Observable<SchoolClass> {
    return this.http.post<SchoolClass>(this.API, c);
  }
  update(id: number, c: Partial<SchoolClass>): Observable<SchoolClass> {
    return this.http.put<SchoolClass>(`${this.API}/${id}`, c);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}
