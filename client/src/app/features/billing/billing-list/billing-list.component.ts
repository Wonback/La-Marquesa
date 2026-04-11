import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingService, Cobro } from '../../../core/services/billing.service';

type FiltroMetodo = 'todos' | 'efectivo' | 'transferencia' | 'debito' | 'credito';

@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './billing-list.component.html'
})
export class BillingListComponent implements OnInit {
  cobros: Cobro[] = [];
  loading = true;

  busqueda = '';
  filtroMetodo: FiltroMetodo = 'todos';

  modalEliminarVisible = false;
  cobroAEliminar: Cobro | null = null;
  eliminandoLoading = false;

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loadCobros();
  }

  loadCobros() {
    this.loading = true;
    this.billingService.getAll().subscribe({
      next: (data) => {
        this.cobros = data.sort((a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get cobrosFiltrados(): Cobro[] {
    return this.cobros.filter(c => {
      const coincideBusqueda =
        c.pedido?.cliente?.nombre?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        c.pedido_id?.toString().includes(this.busqueda) ||
        c.id?.toString().includes(this.busqueda);
      const coincideMetodo =
        this.filtroMetodo === 'todos' ||
        c.metodo_pago?.toLowerCase() === this.filtroMetodo;
      return coincideBusqueda && coincideMetodo;
    });
  }

  get totalFiltrado(): number {
    return this.cobrosFiltrados.reduce((sum, c) => sum + Number(c.monto), 0);
  }

  getPaymentMethodClass(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo':      return 'bg-green-100 text-green-800 border-green-200';
      case 'transferencia': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debito':
      case 'credito':       return 'bg-purple-100 text-purple-800 border-purple-200';
      default:              return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getPaymentIcon(metodo: string): string {
    switch (metodo?.toLowerCase()) {
      case 'efectivo':      return 'fa-money-bill-wave';
      case 'transferencia': return 'fa-university';
      case 'debito':
      case 'credito':       return 'fa-credit-card';
      default:              return 'fa-coins';
    }
  }

  abrirModalEliminar(cobro: Cobro) {
    this.cobroAEliminar = cobro;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.cobroAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.cobroAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.billingService.delete(this.cobroAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.loadCobros();
      },
      error: () => { this.eliminandoLoading = false; }
    });
  }
}
