import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';

const BASIC_URL = environment['BASIC_URL'];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  // =========================
  // 🔐 LOGIN NORMAL
  // =========================
  login(loginRequest: any): Observable<any> {
    return this.http.post(`${BASIC_URL}api/auth/login`, loginRequest).pipe(
      tap(() => this.log('Login request sent')),
      catchError(this.handleError('Login failed'))
    );
  }

  // =========================
  // 🔥 LOGIN CON GOOGLE
  // =========================
  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post(`${BASIC_URL}api/auth/google`, {
      idToken: idToken
    }).pipe(
      tap(() => this.log('Google login request sent')),
      catchError(this.handleError('Google login failed'))
    );
  }

  // =========================
  // 📝 REGISTER
  // =========================
  register(data: any): Observable<any> {
    return this.http.post(`${BASIC_URL}api/auth/signup`, data).pipe(
      tap(() => this.log('Register request sent')),
      catchError(this.handleError('Register failed'))
    );
  }

  // =========================
  // 👤 GET USER
  // =========================
  getUserById(): Observable<any> {
    const userId = UserStorageService.getUserId();

    return this.http.get(`${BASIC_URL}api/auth/user/${userId}`, {
      headers: this.createAuthorizationHeader(),
    }).pipe(
      tap(() => this.log('User fetched successfully')),
      catchError(this.handleError('Error fetching user'))
    );
  }

  // =========================
  // ✏️ UPDATE USER
  // =========================
  updateUser(data: any): Observable<any> {
    return this.http.post(`${BASIC_URL}api/auth/update`, data, {
      headers: this.createAuthorizationHeader(),
    }).pipe(
      tap(() => this.log('User updated successfully')),
      catchError(this.handleError('Error updating user'))
    );
  }

  // =========================
  // 🔐 HEADER JWT
  // =========================
  private createAuthorizationHeader(): HttpHeaders {
    const token = UserStorageService.getToken();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // =========================
  // 🧠 LOG
  // =========================
  private log(message: string): void {
    console.log(`[AuthService]: ${message}`);
  }

  // =========================
  // ⚠️ HANDLE ERROR
  // =========================
  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      console.error(`❌ ${operation}:`, error);

      if (error.status === 0) {
        console.error('🚨 Backend no responde (CORS o servidor apagado)');
      }

      return of(result);
    };
  }
}