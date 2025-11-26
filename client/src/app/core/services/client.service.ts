import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

// Definimos una interfaz reducida de Pedido solo para contar o mostrar lo básico aquí
export interface PedidoResumen {
  id: number;
  fecha_entrega: string;
  estado: string;
  total: number;
}

export interface Cliente {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string; // Viene del Seed
  localidad?: string; // Viene del Seed
  pedidos?: PedidoResumen[]; // Para mostrar historial o cantidad
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('clientes');
  }

  getById(id: number): Observable<Cliente> {
    return this.api.get<Cliente>(`clientes/${id}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.api.post<Cliente>('clientes', cliente);
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.api.put<Cliente>(`clientes/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`clientes/${id}`);
  }
}