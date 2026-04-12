import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface InsumoStockBajo {
  id: number;
  nombre: string;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
}

export interface DashboardStats {
  totalClientes: number;
  totalProductos: number;
  totalIngresos: number;
  ingresosDelMes: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  cobrosPendientes: number;
  estadosPedidos: Record<string, number>;
  recentOrders: any[];
  topProducts: any[];
  insumosStockBajo: InsumoStockBajo[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats');
  }
}