import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserStorageService } from './services/storage/user-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Esta variable controla el estado del menú (abierto o cerrado)
  menuOpen: boolean = false;

  // Variable para controlar la visibilidad del modal de logout
  isLogoutModalVisible: boolean = false;

  title = 'Cafe Vista';

  isCustomerLoggedIn: boolean = UserStorageService.isCustomerLoggedIn();
  isAdminLoggedIn: boolean = UserStorageService.isAdminLoggedIn();

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event.constructor.name === "NavigationEnd") {
        this.isCustomerLoggedIn = UserStorageService.isCustomerLoggedIn();
        this.isAdminLoggedIn = UserStorageService.isAdminLoggedIn();
      }
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
    UserStorageService.signOut();
    this.router.navigateByUrl('login');
  }
}