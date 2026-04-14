import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.includes('auth') || request.url.includes('docs')) {
      return next.handle(request);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        request = request.clone({
          setHeaders: {Authorization: `Bearer ${token}`}
        });
      }
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            // Remove token and redirect
            localStorage.removeItem('token');
            this.router.navigateByUrl('/');
          }
          return throwError(() => error);
        })
      );
    }
  }
}
