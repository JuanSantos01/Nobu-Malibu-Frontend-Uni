import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/noAuth/no-auth.guard';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  // ✅ Redirige ruta vacía a /home
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // ✅ Home visible para todos
  { path: 'home', component: HomeComponent },

  // ✅ Login y Register protegidos por NoAuthGuard
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: SignupComponent, canActivate: [NoAuthGuard] },

  // ✅ Lazy loading para módulos privados
  { path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },

  // ✅ Fallback: manda siempre al Home
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
