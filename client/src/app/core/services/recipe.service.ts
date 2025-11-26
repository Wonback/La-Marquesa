import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Producto } from './product.service';

// Definimos la estructura del Insumo dentro de la receta
export interface InsumoReceta {
  id: number;
  nombre: string;
  unidad_medida: string;
}

export interface DetalleReceta {
  id?: number;
  receta_id?: number;
  insumo_id: number;
  cantidad: number;
  insumo: InsumoReceta; // <--- Para poder mostrar el nombre del ingrediente
}

export interface Receta {
  id?: number;
  producto_id: number;
  nombre: string;
  descripcion?: string;
  instrucciones?: string;
  producto?: Producto;
  // IMPORTANTE: Debe coincidir con el alias del backend ('detallesReceta')
  detallesReceta?: DetalleReceta[]; 
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Receta[]> { return this.api.get<Receta[]>('recetas'); }
  getById(id: number): Observable<Receta> { return this.api.get<Receta>(`recetas/${id}`); }
  create(receta: Receta): Observable<Receta> { return this.api.post<Receta>('recetas', receta); }
  update(id: number, receta: Receta): Observable<Receta> { return this.api.put<Receta>(`recetas/${id}`, receta); }
  delete(id: number): Observable<void> { return this.api.delete<void>(`recetas/${id}`); }
}