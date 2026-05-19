import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  private baseUrl = 'http://localhost:8080/api/predict';

  constructor(private http: HttpClient) {}

  predecir(data: any): Observable<any> {

    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();

    // Solo agregamos el token si existe
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.baseUrl}/noshow`, data, { headers });
  }

}
