import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AdminGuard } from '../guards/authAdmin/admin.guard';

// Components
import { InvestigacionOperacionesComponent } from './components/investigacion-operaciones/investigacion-operaciones.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DatosComponent } from './components/datos/datos.component';
import { PostCategoryComponent } from './components/post-category/post-category.component';
import { PostProductComponent } from './components/post-product/post-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { ViewReservationRequestsComponent } from './components/view-reservation-requests/view-reservation-requests.component';
import { PredictionComponent } from './components/prediction/prediction.component';

const routes: Routes = [
  // ⬇️ SE QUITO EL GUARD TEMPORALMENTE PARA QUE PUEDAS ENTRAR DIRECTO A VER TU PANTALLA
  { path: 'modelo-io', component: InvestigacionOperacionesComponent },
  
  // Información inicial
  { path: 'datos', component: DatosComponent },

  // Dashboard (solo admin)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AdminGuard] },

  // Categorías
  { path: 'category', component: PostCategoryComponent, canActivate: [AdminGuard] },

  // Productos
  { path: ':categoryId/product', component: PostProductComponent, canActivate: [AdminGuard] },
  { path: ':categoryId/view_products', component: ViewProductsComponent, canActivate: [AdminGuard] },
  { path: 'edit_product/:productId', component: UpdateProductComponent, canActivate: [AdminGuard] },

  // Reservas
  { path: 'reservations', component: ViewReservationRequestsComponent, canActivate: [AdminGuard] },

  // Predicción No-Show (solo admin)
  { path: 'prediction', component: PredictionComponent, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
