import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

// Asegurate de definir estas interfaces para leer todos los datos del seed
export interface Insumo {
  id: number;
  nombre: string;
  unidad_medida: string;
}

export interface DetalleReceta {
  cantidad: number;
  insumo: Insumo;
}

export interface Receta {
  nombre: string;
  detallesReceta: DetalleReceta[]; // Ojo con el plural/singular que arreglamos antes en el back
}

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  stock: number;
  es_elaborado: boolean;
  receta?: Receta; // <--- Esto es clave para mostrar los ingredientes
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Producto[]> {
    return this.api.get<Producto[]>('productos');
  }

  getById(id: number): Observable<Producto> {
    return this.api.get<Producto>(`productos/${id}`);
  }

  create(producto: Producto): Observable<Producto> {
    return this.api.post<Producto>('productos', producto);
  }

  update(id: number, producto: Producto): Observable<Producto> {
    return this.api.put<Producto>(`productos/${id}`, producto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`productos/${id}`);
  }
}
