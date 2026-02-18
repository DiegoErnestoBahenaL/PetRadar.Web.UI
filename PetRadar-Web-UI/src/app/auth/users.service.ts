import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

const API_BASE = 'https://api-qa.petradar-qa.org/api';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly usersUrl = `${API_BASE}/Users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/${id}`);
  }

  create(user: Partial<User> & { password: string }): Observable<User> {
    return this.http.post<User>(this.usersUrl, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
