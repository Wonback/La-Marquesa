import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BillingService, Cobro } from '../../../core/services/billing.service';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './billing-list.component.html'
})
export class BillingListComponent implements OnInit {
  cobros: Cobro[] = [];
  loading: boolean = true;

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loadCobros();
  }

  loadCobros() {
    this.loading = true;
    this.billingService.getAll().subscribe({
      next: (data) => {
        // Ordenar por fecha (más reciente primero)
        this.cobros = data.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading billing', err);
        this.loading = false;
      }
    });
  }

  deleteCobro(id: number) {
    if (confirm('¿Estás seguro de eliminar este registro de cobro? Esto NO revierte el estado del pedido.')) {
      this.billingService.delete(id).subscribe(() => {
        this.loadCobros();
      });
    }
  }

  // Helper para colores de método de pago
  getPaymentMethodClass(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo': return 'bg-green-100 text-green-800 border-green-200';
      case 'transferencia': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debito':
      case 'credito': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Helper para iconos
  getPaymentIcon(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo': return 'fa-money-bill-wave';
      case 'transferencia': return 'fa-university';
      case 'debito':
      case 'credito': return 'fa-credit-card';
      default: return 'fa-coins';
    }
  }
}