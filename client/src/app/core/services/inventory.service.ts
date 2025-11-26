import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Insumo {
  id?: number;
  nombre: string;
  unidad_medida: string; // <--- IMPORTANTE: Debe estar aquí
  stock: number;
  stock_minimo: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Insumo[]> { return this.api.get<Insumo[]>('insumos'); }
  getById(id: number): Observable<Insumo> { return this.api.get<Insumo>(`insumos/${id}`); }
  create(insumo: Insumo): Observable<Insumo> { return this.api.post<Insumo>('insumos', insumo); }
  update(id: number, insumo: Insumo): Observable<Insumo> { return this.api.put<Insumo>(`insumos/${id}`, insumo); }
  delete(id: number): Observable<void> { return this.api.delete<void>(`insumos/${id}`); }
}