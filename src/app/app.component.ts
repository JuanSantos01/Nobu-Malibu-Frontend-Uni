import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth/auth.service'; // 🔥 Asegúrate de que la ruta sea la correcta
import { UserStorageService } from './services/storage/user-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  // Esta variable controla el estado del menú (abierto o cerrado)
  menuOpen: boolean = false;

  // Variable para controlar la visibilidad del modal de logout
  isLogoutModalVisible: boolean = false;

  title = 'Cafe Vista';

  // Cambiamos a valores iniciales falsos; el AuthService se encargará de setearlos al arrancar
  isCustomerLoggedIn: boolean = false;
  isAdminLoggedIn: boolean = false;

  // 🔥 Propiedad para guardar la suscripción y evitar fugas de memoria
  private authSubscription!: Subscription;

  // 🔥 Inyectamos el AuthService en el constructor
  constructor(
    private router: Router,
    private authService: AuthService 
  ) { }

  ngOnInit(): void {
    // 🔥 ESCUCHA REACTIVA: Cada vez que el Login o el Logout gatillen un cambio, esto se ejecuta al instante
    this.authSubscription = this.authService.isLoggedIn$.subscribe(() => {
      this.isCustomerLoggedIn = UserStorageService.isCustomerLoggedIn();
      this.isAdminLoggedIn = UserStorageService.isAdminLoggedIn();
      console.log('[Navbar] Estado actualizado:', { 
        admin: this.isAdminLoggedIn, 
        customer: this.isCustomerLoggedIn 
      });
    });
  }

  // Función para alternar la visibilidad del menú
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Función para cerrar el menú cuando un enlace sea seleccionado
  closeMenu() {
    this.menuOpen = false;
  }

  // Función para mostrar el modal de confirmación de logout
  confirmLogout() {
    this.isLogoutModalVisible = true;
    this.closeMenu(); // Cerrar el menú móvil si está abierto
  }

  // Función que se ejecuta cuando se confirma el logout
  handleLogoutOk() {
    this.isLogoutModalVisible = false;
    this.logout();
  }

  // Función que se ejecuta cuando se cancela el logout
  handleLogoutCancel() {
    this.isLogoutModalVisible = false;
  }

  // Función principal de logout
  logout() {
    // 🔥 Usamos el logout del servicio para que limpie el almacenamiento y emita el estado "false" al Navbar
    this.authService.logout();
    this.router.navigateByUrl('login');
  }

  // 🔥 Limpieza de la suscripción al destruir el componente
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
