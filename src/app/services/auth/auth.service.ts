import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Usamos un getter para acceder al valor en tiempo real y evitar el 'undefined'
  private get baseUrl() {
    return environment.BASIC_URL;
  }

  constructor(private http: HttpClient) {}

  login(loginRequest: any): Observable<any> {
    // La concatenación es segura al usar el getter
    return this.http.post(`${this.baseUrl}api/auth/login`, loginRequest).pipe(
      tap(() => this.log('Login request sent')),
      catchError(this.handleError('Login failed'))
    );
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}api/auth/google`, { idToken }).pipe(
      tap(() => this.log('Google login request sent')),
      catchError(this.handleError('Google login failed'))
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}api/auth/signup`, data).pipe(
      tap(() => this.log('Register request sent')),
      catchError(this.handleError('Register failed'))
    );
  }

  getUserById(): Observable<any> {
    const userId = UserStorageService.getUserId();
    return this.http.get(`${this.baseUrl}api/auth/user/${userId}`, {
      headers: this.createAuthorizationHeader(),
    }).pipe(
      tap(() => this.log('User fetched successfully')),
      catchError(this.handleError('Error fetching user'))
    );
  }

  updateUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}api/auth/update`, data, {
      headers: this.createAuthorizationHeader(),
    }).pipe(
      tap(() => this.log('User updated successfully')),
      catchError(this.handleError('Error updating user'))
    );
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = UserStorageService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private log(message: string): void {
    console.log(`[AuthService]: ${message}`);
  }

  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      console.error(`❌ ${operation}:`, error);
      if (error.status === 0) {
        console.error('🚨 Backend no responde (posible error de CORS o URL incorrecta)');
      }
      return of(result);
    };
  }
}
