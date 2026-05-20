import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// 🚨 CORRECCIÓN DEFINITIVA DE RUTA: Un solo nivel hacia atrás para llegar a src/app/
import { DemoNgZorroAntdModule } from '../DemoNgZorroAntdModule';

// Todos los componentes del módulo de administración
import { InvestigacionOperacionesComponent } from './components/investigacion-operaciones/investigacion-operaciones.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DatosComponent } from './components/datos/datos.component';
import { PostCategoryComponent } from './components/post-category/post-category.component';
import { PostProductComponent } from './components/post-product/post-product.component';
import { ViewProductsComponent } from './components/view-products/view-products.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
import { ViewReservationRequestsComponent } from './components/view-reservation-requests/view-reservation-requests.component';
import { PredictionComponent } from './components/prediction/prediction.component';

@NgModule({
  declarations: [
    InvestigacionOperacionesComponent,
    DashboardComponent,
    DatosComponent,
    PostCategoryComponent,
    PostProductComponent,
    ViewProductsComponent,
    UpdateProductComponent,
    ViewReservationRequestsComponent,
    PredictionComponent
  ],
  imports: [
    CommonModule,
    DemoNgZorroAntdModule, // Al arreglarse la ruta arriba, este dejará de marcar error
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
