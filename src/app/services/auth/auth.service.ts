import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserStorageService } from '../storage/user-storage.service';

const BASIC_URL = environment['BASIC_URL'];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🔄 1. Creamos el BehaviorSubject que vigila el estado de la sesión.
  // Inicializa en 'true' si ya existe un token guardado (por si el usuario refresca la página)
  private authState$ = new BehaviorSubject<boolean>(UserStorageService.hasToken?.() || !!UserStorageService.getToken());

  constructor(private http: HttpClient) {}

  // 🔄 2. Exponemos el estado como un Observable para que el Navbar se suscriba
  get isLoggedIn$(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  // 🔄 3. Método para forzar la actualización del estado desde fuera (por si guardas el token en el componente)
  updateAuthState(): void {
    const isLogged = !!UserStorageService.getToken();
    this.authState$.next(isLogged);
  }

  // =========================
  // 🔐 LOGIN NORMAL
  // =========================
  login(loginRequest: any): Observable<any> {
    return this.http.post(`${BASIC_URL}api/auth/login`, loginRequest).pipe(
      tap(() => {
        this.log('Login request sent');
        // NOTA: Si guardas el token AQUÍ adentro usando UserStorageService, descomenta la línea de abajo:
        // this.authState$.next(true);
      }),
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
      tap(() => {
        this.log('Google login request sent');
        // NOTA: Si guardas el token AQUÍ adentro usando UserStorageService, descomenta la línea de abajo:
        // this.authState$.next(true);
      }),
      catchError(this.handleError('Google login failed'))
    );
  }

  // =========================
  // 📝 LOGOUT (Añádelo si no lo tenías aquí)
  // =========================
  logout(): void {
    UserStorageService.signOut?.(); // O el método que uses para borrar el localStorage
    this.authState$.next(false); // Le avisamos al Navbar que limpie los botones
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
