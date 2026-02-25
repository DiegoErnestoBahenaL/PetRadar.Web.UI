import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const API_ROOT = 'https://api-qa.petradar-qa.org';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  // Endpoints públicos 
  const isLogin = req.url.includes('/api/gate/Login');
  const isRegister = req.url === `${API_ROOT}/api/Users` && req.method === 'POST';

  // const isApi = req.url.startsWith(API_ROOT);

  if (token && !isLogin && !isRegister) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      // regreso al login si el backend manda 401
      if (err?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/']);
      }
      return throwError(() => err);
    })
  );
};