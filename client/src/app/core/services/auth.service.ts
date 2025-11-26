import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: any): Observable<any> {
    return this.api.post('auth/login', credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.api.post('auth/register', data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: any) {
    localStorage.setItem('token', authResult.token);
    // Assuming the backend returns user info along with token, or we decode it.
    // For now, let's assume authResult has a user object or we'll fetch it.
    // If the backend only returns token, we might need another call to get profile.
    // Based on common practices, let's store what we have.
    if (authResult.user) {
        localStorage.setItem('user', JSON.stringify(authResult.user));
        this.userSubject.next(authResult.user);
    }
    this.isAuthenticatedSubject.next(true);
  }
  
  getToken(): string | null {
      return localStorage.getItem('token');
  }
}
