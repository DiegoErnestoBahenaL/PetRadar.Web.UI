// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {}

  registrar(payload: RegisterPayload): Observable<void> {
    // TODO: conectar a backend
    console.log('Registrando usuario', payload);
    return of(void 0);
  }

  login(payload: LoginPayload): Observable<{ token: string; requiereVerificacion?: boolean }> {
    // TODO: conectar a backend
    console.log('Iniciando sesión', payload);

    // Ejemplo
    if (payload.correo === 'no-verificado@ejemplo.com') {
      return of({ token: '', requiereVerificacion: true });
    }

    if (payload.password !== '12345678') {
      return throwError(() => new Error('CREDENCIALES_INVALIDAS'));
    }

    return of({ token: 'fake-jwt-token' });
  }

  reenviarVerificacion(correo: string): Observable<void> {
    console.log('Reenviando verificación a', correo);
    return of(void 0);
  }

  recuperarPassword(correo: string): Observable<void> {
    console.log('Recuperando password para', correo);
    return of(void 0);
  }
}
