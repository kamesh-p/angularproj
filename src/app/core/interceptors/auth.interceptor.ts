import { HttpInterceptorFn, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const startTime = Date.now();

  // ===== REQUEST LOGGING =====
  console.log('═══════════════════════════════════════════════════');
  console.log('[HTTP INTERCEPTOR] ➡️  REQUEST INITIATED');
  console.log('[HTTP INTERCEPTOR] Method:', req.method);
  console.log('[HTTP INTERCEPTOR] URL:', req.url);
  console.log('[HTTP INTERCEPTOR] Headers:', req.headers.keys());
  console.log('[HTTP INTERCEPTOR] Body:', req.body);
  console.log('═══════════════════════════════════════════════════');

  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  console.log('[HTTP INTERCEPTOR] 🔑 Token exists:', !!token);

  // Clone request and add headers if needed
  let modifiedReq = req;

  // Skip adding auth headers for login/auth endpoints
  if (req.url.includes('/auth/') || req.url.includes('/login')) {
    console.log('[HTTP INTERCEPTOR] ⏭️  Skipping auth for login/auth endpoint');
  } else if (token) {
    // Add authorization header
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('[HTTP INTERCEPTOR] ✅ Authorization header added');
    console.log('[HTTP INTERCEPTOR] Modified Headers:', modifiedReq.headers.keys());
  } else {
    console.log('[HTTP INTERCEPTOR] ⚠️  No token found, proceeding without auth header');
  }

  // Send the request and handle response/errors
  return next(modifiedReq).pipe(
    tap(event => {
      // Log successful responses
      if (event.type === HttpEventType.Response) {
        const elapsedTime = Date.now() - startTime;
        console.log('═══════════════════════════════════════════════════');
        console.log('[HTTP INTERCEPTOR] ⬅️  RESPONSE RECEIVED');
        console.log('[HTTP INTERCEPTOR] URL:', req.url);
        console.log('[HTTP INTERCEPTOR] Status:', event.status);
        console.log('[HTTP INTERCEPTOR] Status Text:', event.statusText);
        console.log('[HTTP INTERCEPTOR] ⏱️  Time:', elapsedTime + 'ms');
        console.log('[HTTP INTERCEPTOR] Response Body:', event.body);
        console.log('═══════════════════════════════════════════════════');
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const elapsedTime = Date.now() - startTime;
      
      // ===== ERROR LOGGING =====
      console.log('═══════════════════════════════════════════════════');
      console.error('[HTTP INTERCEPTOR] ❌ ERROR OCCURRED');
      console.error('[HTTP INTERCEPTOR] URL:', req.url);
      console.error('[HTTP INTERCEPTOR] Method:', req.method);
      console.error('[HTTP INTERCEPTOR] Status:', error.status);
      console.error('[HTTP INTERCEPTOR] Status Text:', error.statusText);
      console.error('[HTTP INTERCEPTOR] Error Message:', error.message);
      console.error('[HTTP INTERCEPTOR] Error Details:', error.error);
      console.error('[HTTP INTERCEPTOR] ⏱️  Time:', elapsedTime + 'ms');
      console.log('═══════════════════════════════════════════════════');

      // Handle specific error codes
      if (error.status === 401) {
        console.warn('[HTTP INTERCEPTOR] 🚫 Unauthorized - Redirecting to login');
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.warn('[HTTP INTERCEPTOR] 🚫 Forbidden - Access Denied');
      } else if (error.status === 404) {
        console.warn('[HTTP INTERCEPTOR] 🔍 Not Found - Resource does not exist');
      } else if (error.status >= 500) {
        console.error('[HTTP INTERCEPTOR] 🔥 Server Error:', error.status);
      } else if (error.status === 0) {
        console.error('[HTTP INTERCEPTOR] 🌐 Network Error - Check your connection');
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};