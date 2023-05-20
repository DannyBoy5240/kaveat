/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.getAuthToken().pipe(
      take(1),
      switchMap((token: any) => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        return next.handle(request);
      })
    );
    return next.handle(request).pipe(
      catchError((err) => {
        // if (err.status === 401) {
        //   this.authService.logout();
        // }
        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
