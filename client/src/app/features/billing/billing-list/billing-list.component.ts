import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BillingService, Cobro } from '../../../core/services/billing.service';
import { ToastService } from '../../../core/services/toast.service';

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

  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private billingService: BillingService, private toast: ToastService) {}

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

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.cobrosFiltrados.length / this.itemsPorPagina));
  }

  get cobrosPaginados(): Cobro[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.cobrosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(n: number) {
    if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n;
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

  // ── Cierre del día ────────────────────────────────────────────────────────
  readonly hoyStr = new Date().toDateString();

  get cobrosHoy(): Cobro[] {
    return this.cobros.filter(c => new Date(c.fecha).toDateString() === this.hoyStr);
  }

  get totalHoy(): number {
    return this.cobrosHoy.reduce((sum, c) => sum + Number(c.monto), 0);
  }

  get cierreDesglose(): { metodo: string; total: number; cantidad: number }[] {
    const metodos = ['efectivo', 'transferencia', 'debito', 'credito'];
    return metodos
      .map(m => ({
        metodo: m,
        total: this.cobrosHoy
          .filter(c => c.metodo_pago?.toLowerCase() === m)
          .reduce((s, c) => s + Number(c.monto), 0),
        cantidad: this.cobrosHoy.filter(c => c.metodo_pago?.toLowerCase() === m).length
      }))
      .filter(d => d.cantidad > 0);
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
        this.toast.success('Cobro eliminado correctamente.');
        this.loadCobros();
      },
      error: () => {
        this.eliminandoLoading = false;
        this.toast.error('No se pudo eliminar el cobro.');
      }
    });
  }
}
