import { Component } from '@angular/core';
import { InvestigacionOperacionesService } from '../../admin-services/investigacion-operaciones.service';

@Component({
  selector: 'app-investigacion-operaciones',
  templateUrl: './investigacion-operaciones.component.html',
  styleUrls: ['./investigacion-operaciones.component.scss']
})
export class InvestigacionOperacionesComponent {

  // Variables mapeadas exactamente igual al HTML
  mesasDisponibles2P: number = 10; 
  mesasDisponibles4P: number = 15;
  capacidadTotalPersonas: number = 50;

  resultadoIO: any = null;
  cargando: boolean = false;

  constructor(private ioService: InvestigacionOperacionesService) { }

  // Nombre del método sin tilde para acoplarse al (click) del HTML
  calcularOptimizacion() {
    this.cargando = true;
    
    const body = {
      mesasDisponibles2P: this.mesasDisponibles2P,
      mesasDisponibles4P: this.mesasDisponibles4P,
      capacidadTotalPersonas: this.capacidadTotalPersonas
    };

    this.ioService.enviarModelo(body).subscribe({
      next: (res) => {
        this.resultadoIO = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al conectar con el backend", err);
        this.cargando = false;
      }
    });
  }
}