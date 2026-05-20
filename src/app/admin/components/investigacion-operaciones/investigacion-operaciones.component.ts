import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-investigacion-operaciones',
  templateUrl: './investigacion-operaciones.component.html',
  styleUrls: ['./investigacion-operaciones.component.scss']
})
export class InvestigacionOperacionesComponent implements OnInit {
  validateForm!: FormGroup;
  
  // Variables de control de la UI
  mostrarResultados: boolean = false;
  verExplicacion: boolean = false; // Controla el colapsable educativo

  // Variables de salida del modelo matemático
  mesasOptimas: number = 0;
  personasPorMesa: number = 0;
  capacidadUtilizada: number = 0;
  eficiencia: number = 0;
  costoTotal: number = 0;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      capacidadMaxima: [null, [Validators.required, Validators.min(1)]],
      mesasDisponibles: [null, [Validators.required, Validators.min(1)]],
      costoMesa: [50, [Validators.required, Validators.min(0)]] // Nueva variable: Costo unitario
    });
  }

  toggleExplicacion(): void {
    this.verExplicacion = !this.verExplicacion;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const { capacidadMaxima, mesasDisponibles, costoMesa } = this.validateForm.value;

      // Parámetro constante de confort (4 personas por mesa estándar)
      const k = 4; 
      
      // Aplicación de la Función Techo: Ceil(N / k)
      const mesasNecesarias = Math.ceil(capacidadMaxima / k);

      if (mesasNecesarias <= mesasDisponibles) {
        this.mesasOptimas = mesasNecesarias;
        this.personasPorMesa = k;
      } else {
        // Escenario de escasez extrema: forzar densidad máxima
        this.mesasOptimas = mesasDisponibles;
        this.personasPorMesa = Math.ceil(capacidadMaxima / mesasDisponibles);
      }

      // Cálculos del reporte de optimización
      this.capacidadUtilizada = this.mesasOptimas * this.personasPorMesa;
      this.eficiencia = Math.min(Math.round((capacidadMaxima / this.capacidadUtilizada) * 100), 100);
      
      // Ecuación de la Función Objetivo: Z = C_mesa * x
      this.costoTotal = this.mesasOptimas * costoMesa;
      
      this.mostrarResultados = true;
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}