import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Cliente } from './client.service';
import { Producto } from './product.service';

export interface DetallePedido {
  id?: number;
  cantidad: number;
  precio_unitario?: number; // Opcional si lo calculas en el back
  subtotal?: number;
  observaciones?: string;
  producto: Producto;
}

export interface Pedido {
  id?: number;
  cliente_id: number;
  fecha_entrega: string | Date; // El backend manda string ISO
  estado: 'registrado' | 'confirmado' | 'en producción' | 'listo' | 'entregado';
  total?: number; // Si tu back lo calcula o lo sumamos en el front
  cliente?: Cliente;
  detallePedidos?: DetallePedido[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>('pedidos');
  }

  getById(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`pedidos/${id}`);
  }

  create(pedido: Pedido): Observable<Pedido> {
    return this.api.post<Pedido>('pedidos', pedido);
  }
  
  update(id: number, pedido: any): Observable<Pedido> {
    return this.api.put<Pedido>(`pedidos/${id}`, pedido);
  }
  
  // Método especial para cambiar estado (Confirmar, Entregar, etc.)
  updateStatus(id: number, estado: string): Observable<Pedido> {
    return this.api.put<Pedido>(`pedidos/${id}/estado`, { estado });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`pedidos/${id}`);
  }
}