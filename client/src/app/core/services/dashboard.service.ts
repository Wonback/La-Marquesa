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

export interface ClienteFrecuente {
  nombre: string;
  totalPedidos: number;
  ingresos: number;
}

export interface PedidoSinCobrar {
  id: number;
  cliente: string;
  montoEstimado: number;
}

export interface IngresoMes {
  mes: string;
  ingresos: number;
  cantidad: number;
}

export interface PedidoDia {
  dia: string;
  cantidad: number;
}

export interface DashboardStats {
  // Existentes
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
  topProductsMes: any[];
  topProductsAno: any[];
  topProductsHistorico: any[];
  insumosStockBajo: InsumoStockBajo[];
  // Nuevos
  ingresosMesAnterior: number;
  ingresosSemanaActual: number;
  ingresosSemanaAnterior: number;
  ticketPromedio: number;
  pedidosDelMes: number;
  tasaCompletitud: number;
  tiempoPromedioProduccion: number | null;
  pedidosVencenHoy: number;
  pedidosVencidos: number;
  clientesFrecuentes: ClienteFrecuente[];
  pedidosSinCobrar: PedidoSinCobrar[];
  ingresosPorMes: IngresoMes[];
  pedidosPorDia: PedidoDia[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats');
  }
}
