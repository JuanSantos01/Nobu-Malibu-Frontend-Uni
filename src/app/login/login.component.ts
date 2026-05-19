import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth/auth.service';
import { UserStorageService } from '../services/storage/user-storage.service';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  validateForm!: FormGroup;
  isSpinning = false;
  errorMessage: string = '';
  hasError = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [false]
    });
  }

  // 🔥 SE EJECUTA CUANDO YA EXISTE EL HTML
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadGoogle();
    }, 500); // 🔥 pequeña espera evita errores
  }

  // =========================
  // 🔥 GOOGLE INIT
  // =========================
  loadGoogle() {
    if (typeof google === 'undefined') {
      console.error('❌ Google script not loaded');
      return;
    }

    const button = document.getElementById("googleBtn");

    if (!button) {
      console.error('❌ googleBtn no existe en el HTML');
      return;
    }

    google.accounts.id.initialize({
      client_id: '547508998396-tmaqfejbsmrevlgkfflsieptrn73lr1p.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "large",
      width: 250
    });

    // 🔥 OPCIONAL (mejora UX)
    google.accounts.id.prompt();
  }

  // =========================
  // 🔥 LOGIN GOOGLE
  // =========================
  handleGoogleLogin(response: any) {

    if (!response || !response.credential) {
      console.error('❌ No viene token de Google');
      return;
    }

    const token = response.credential;

    console.log("✅ TOKEN GOOGLE:", token);

    this.authService.loginWithGoogle(token).subscribe({
      next: (res: any) => {

        console.log("✅ BACKEND RESPONSE:", res);

        if (!res || !res.jwt) {
          this.notification.error('ERROR', 'Invalid backend response');
          return;
        }

        const user = {
          id: res.userId,
          role: res.userRole
        };

        UserStorageService.saveUser(user);
        UserStorageService.saveToken(res.jwt);

        if (UserStorageService.isAdminLoggedIn()) {
          this.router.navigateByUrl('admin/dashboard');
        } else {
          this.router.navigateByUrl('customer/dashboard');
        }

        this.notification.success(
          'SUCCESS',
          'Logged in with Google!',
          { nzDuration: 3000 }
        );
      },
      error: (err) => {
        console.error("❌ GOOGLE LOGIN ERROR:", err);

        this.notification.error(
          'ERROR',
          'Google login failed',
          { nzDuration: 5000 }
        );
      }
    });
  }

  // =========================
  // 🔐 LOGIN NORMAL
  // =========================
  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.isSpinning = true;
    this.clearError();

    this.authService.login(this.validateForm.value).subscribe(
      (res) => {
        this.isSpinning = false;

        if (res && res.userId != null) {

          const user = {
            id: res.userId,
            role: res.userRole
          };

          UserStorageService.saveUser(user);
          UserStorageService.saveToken(res.jwt);

          if (UserStorageService.isAdminLoggedIn()) {
            this.router.navigateByUrl('admin/dashboard');
          } else {
            this.router.navigateByUrl('customer/dashboard');
          }

          this.notification.success(
            'SUCCESS',
            'Welcome back!',
            { nzDuration: 3000 }
          );

        } else {
          this.showError('Username or password incorrect');
        }
      },
      (error) => {
        this.isSpinning = false;

        if (error.status === 401) {
          this.showError('Invalid credentials');
        } else if (error.status === 404) {
          this.showError('User not found');
        } else {
          this.showError('Server error');
        }

        this.notification.error(
          'ERROR',
          'Login failed',
          { nzDuration: 5000 }
        );
      }
    );
  }

  // =========================
  // UI HELPERS
  // =========================
  private showError(message: string): void {
    this.errorMessage = message;
    this.hasError = true;
  }

  clearError(): void {
    this.errorMessage = '';
    this.hasError = false;
  }

  onInputChange(): void {
    if (this.hasError) {
      this.clearError();
    }
  }
}