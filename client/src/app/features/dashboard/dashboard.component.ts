import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  // CORRECCIÓN AQUÍ: Agregamos los arrays vacíos para cumplir con la interfaz
  stats: DashboardStats = {
    totalClientes: 0,
    totalProductos: 0,
    totalPedidos: 0,
    totalIngresos: 0,
    pedidosPendientes: 0,
    pedidosEntregados: 0,
    recentOrders: [], // <--- FALTABA ESTO
    topProducts: []   // <--- FALTABA ESTO
  };
  
  // Estas variables auxiliares ya no son estrictamente necesarias si usas stats.recentOrders
  // pero las dejamos por si las usas en otra lógica o las puedes borrar.
  recentOrders: any[] = [];
  topProducts: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        // Opcional: Sincronizar las variables locales si las usabas
        this.recentOrders = data.recentOrders;
        this.topProducts = data.topProducts;
      },
      error: (err) => console.error('Error loading dashboard stats', err)
    });
  }
}