import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Pedido } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';

type FiltroEstado = 'pendientes' | 'todos' | 'registrado' | 'confirmado' | 'en producción' | 'listo' | 'entregado';


@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;

  busqueda = '';
  filtroEstado: FiltroEstado = 'pendientes'; // default: ocultar entregados

  errorBanner: string | null = null;

  paginaActual = 1;
  readonly itemsPorPagina = 10;

  modalEliminarVisible = false;
  pedidoAEliminar: Pedido | null = null;
  eliminandoLoading = false;

  constructor(private orderService: OrderService, private toast: ToastService) {}

  ngOnInit() {
    this.loadPedidos();
  }

  loadPedidos() {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data.sort((a, b) =>
          new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime()
        );
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Filtrado ──────────────────────────────────────────────────────────────
  get pedidosFiltrados(): Pedido[] {
    return this.pedidos.filter(p => {
      const q = this.busqueda.toLowerCase();
      const coincideBusqueda =
        p.cliente?.nombre?.toLowerCase().includes(q) ||
        p.id?.toString().includes(q);

      let coincideEstado: boolean;
      if (this.filtroEstado === 'todos') {
        coincideEstado = true;
      } else if (this.filtroEstado === 'pendientes') {
        coincideEstado = p.estado !== 'entregado';
      } else {
        coincideEstado = p.estado === this.filtroEstado;
      }

      return coincideBusqueda && coincideEstado;
    });
  }

  get contadores(): Record<string, number> {
    const estados = ['registrado', 'confirmado', 'en producción', 'listo', 'entregado'];
    const result: Record<string, number> = {};
    estados.forEach(e => {
      result[e] = this.pedidos.filter(p => p.estado === e).length;
    });
    result['pendientes'] = this.pedidos.filter(p => p.estado !== 'entregado').length;
    return result;
  }

  // ── Paginación ────────────────────────────────────────────────────────────
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina));
  }

  get pedidosPaginados(): Pedido[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.pedidosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(n: number) {
    if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n;
  }

  // ── Pedidos vencidos (para el banner) ─────────────────────────────────────
  get pedidosVencidos(): Pedido[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.pedidos.filter(p => {
      if (p.estado === 'entregado') return false;
      const entrega = new Date(p.fecha_entrega);
      entrega.setHours(0, 0, 0, 0);
      return entrega < hoy;
    });
  }

  // ── Urgencia por fila ─────────────────────────────────────────────────────
  getDiasInfo(pedido: Pedido): { label: string; rowClases: string; labelClases: string } {
    if (pedido.estado === 'entregado') {
      return {
        label: new Date(pedido.fecha_entrega).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        rowClases: '',
        labelClases: 'text-gray-400',
      };
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(pedido.fecha_entrega);
    entrega.setHours(0, 0, 0, 0);
    const diff = Math.round((entrega.getTime() - hoy.getTime()) / 86_400_000);

    if (diff < 0)   return { label: 'Vencido',       rowClases: 'bg-red-50',    labelClases: 'text-red-600 font-bold' };
    if (diff === 0) return { label: 'Hoy',            rowClases: 'bg-orange-50', labelClases: 'text-orange-600 font-bold' };
    if (diff === 1) return { label: 'Mañana',         rowClases: '',             labelClases: 'text-yellow-600 font-semibold' };
    return                 { label: `En ${diff} días`, rowClases: '',            labelClases: 'text-gray-500' };
  }

  isUrgente(pedido: Pedido): boolean {
    if (pedido.estado === 'entregado') return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(pedido.fecha_entrega);
    entrega.setHours(0, 0, 0, 0);
    return entrega <= hoy;
  }

  // ── Estilos de estado ─────────────────────────────────────────────────────
  getStatusColor(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'registrado':    return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'confirmado':    return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en producción': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'listo':         return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'entregado':     return 'bg-green-100 text-green-800 border-green-200';
      default:              return 'bg-gray-100 text-gray-800';
    }
  }

  calculateTotal(pedido: Pedido): number {
    if (pedido.total !== undefined && Number(pedido.total) > 0) return Number(pedido.total);
    return pedido.detallePedidos?.reduce((acc, item) => {
      const precio = Number(item.precio_unitario) || Number(item.producto?.precio) || 0;
      return acc + (Number(item.cantidad) * precio);
    }, 0) || 0;
  }

  // ── Cambio de estado ──────────────────────────────────────────────────────
  avanzarEstado(pedido: Pedido) {
    if (!pedido.id) return;
    const siguiente: Record<string, string> = {
      'registrado':    'confirmado',
      'confirmado':    'en producción',
      'en producción': 'listo',
    };
    const nuevoEstado = siguiente[pedido.estado];
    if (!nuevoEstado) return;
    this.cambiarEstado(pedido, nuevoEstado);
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    if (!pedido.id) return;
    this.errorBanner = null;
    const estadoAnterior = pedido.estado;
    pedido.estado = nuevoEstado as any;

    this.orderService.updateStatus(pedido.id, nuevoEstado).subscribe({
      next: () => {
        this.toast.success(`Estado actualizado a "${nuevoEstado}".`);
      },
      error: (err) => {
        pedido.estado = estadoAnterior;
        this.errorBanner = err.error?.message || 'No se pudo cambiar el estado del pedido.';
        this.toast.error(this.errorBanner!);
      }
    });
  }

  // ── Modal eliminación ─────────────────────────────────────────────────────
  abrirModalEliminar(pedido: Pedido) {
    this.pedidoAEliminar = pedido;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.pedidoAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.pedidoAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.orderService.delete(this.pedidoAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.toast.success('Pedido eliminado correctamente.');
        this.loadPedidos();
      },
      error: () => {
        this.eliminandoLoading = false;
        this.toast.error('No se pudo eliminar el pedido.');
      }
    });
  }
}
