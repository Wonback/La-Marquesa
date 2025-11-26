import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Pedido } from './order.service';

export interface Cobro {
  id?: number;
  pedido_id: number;
  monto: number;
  fecha: string;
  metodo_pago: string;
  pedido?: Pedido;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Cobro[]> {
    return this.api.get<Cobro[]>('cobros');
  }

  getById(id: number): Observable<Cobro> {
    return this.api.get<Cobro>(`cobros/${id}`);
  }

  create(cobro: Cobro): Observable<Cobro> {
    return this.api.post<Cobro>('cobros', cobro);
  }

  update(id: number, cobro: Cobro): Observable<Cobro> {
    return this.api.put<Cobro>(`cobros/${id}`, cobro);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`cobros/${id}`);
  }
}