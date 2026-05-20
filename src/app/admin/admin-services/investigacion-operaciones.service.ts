import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestigacionOperacionesService {

  // URL del controlador que creamos en Spring Boot
  private apiUrl = 'https://nobu-malibu-backend-uni-2.onrender.com/api/investigacion-operaciones/optimizar-mesas';

  constructor(private http: HttpClient) { }

  enviarModelo(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
}
