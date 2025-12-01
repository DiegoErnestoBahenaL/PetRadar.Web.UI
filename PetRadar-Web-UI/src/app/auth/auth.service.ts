import { Injectable } from '@angular/core';
import { Observable, map, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';


const API_ROOT = 'https://api-qa.petradar-qa.org';

const API_USERS = `${API_ROOT}/api/Users`;
const API_LOGIN = `${API_ROOT}/gate/Login`;


// Payloads 
export interface RegisterPayload {
  nombreCompleto: string;
  correo: string;
  password: string;
  telefono?: string | null;
  aceptaPrivacidad: boolean;
}

export interface LoginPayload {
  correo: string;
  password: string;
  recordarCorreo: boolean;
}

interface BackendLoginResponse {
  token: string;
  user?: User;
  // campos adicionales
}

interface BackendCreateUserRequest {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  // campos adicionales
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

registrar(payload: RegisterPayload): Observable<void> {
  const body: BackendCreateUserRequest = {
    email: payload.correo,
    password: payload.password,
    name: payload.nombreCompleto,
    lastName: '',
    phoneNumber: payload.telefono ?? ''
  };

  return this.http.post<User>(API_USERS, body).pipe(
    map(() => void 0)
  );
}

login(payload: LoginPayload): Observable<{ token: string; requiereVerificacion?: boolean }> {
  const body = {
    email: payload.correo,
    password: payload.password
  };

  return this.http.post<BackendLoginResponse>(API_LOGIN, body).pipe(
    map(resp => {
      if (!resp.token) {
        throw new Error('CREDENCIALES_INVALIDAS');
      }

      localStorage.setItem('token', resp.token);
      if (resp.user) {
        localStorage.setItem('user', JSON.stringify(resp.user));
      }

      return {
        token: resp.token,
        requiereVerificacion: false
      };
    })
  );
}
  
 // Utilidades

  reenviarVerificacion(correo: string): Observable<void> {
    console.log('Reenviando verificación (dummy) a', correo);
    // TODO: reemplazar posteriormente por endpoint
    return of(void 0);
  }

  recuperarPassword(correo: string): Observable<void> {
    console.log('Recuperando password (dummy) para', correo);
    // TODO: reemplzarar por endpoint
    return of(void 0);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
