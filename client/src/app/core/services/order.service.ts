import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Cliente } from './client.service';
import { Producto } from './product.service';

export interface DetallePedido {
  id?: number;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
  observaciones?: string;
  producto: Producto;
}

export interface HistorialPedido {
  id?: number;
  pedido_id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_nombre: string;
  fecha: string;
}

export interface Pedido {
  id?: number;
  cliente_id: number;
  fecha_entrega: string | Date;
  estado: 'registrado' | 'confirmado' | 'en producción' | 'listo' | 'entregado';
  total?: number;
  cliente?: Cliente;
  detallePedidos?: DetallePedido[];
  historialPedidos?: HistorialPedido[];
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

  revertir(id: number): Observable<any> {
    return this.api.put<any>(`pedidos/${id}/revertir`, {});
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`pedidos/${id}`);
  }
}