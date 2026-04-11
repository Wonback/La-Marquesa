import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Pedido } from '../../../core/services/order.service';

type FiltroEstado = 'todos' | 'registrado' | 'confirmado' | 'en producción' | 'listo' | 'entregado';

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
  filtroEstado: FiltroEstado = 'todos';

  errorBanner: string | null = null;

  modalEliminarVisible = false;
  pedidoAEliminar: Pedido | null = null;
  eliminandoLoading = false;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadPedidos();
  }

  loadPedidos() {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.pedidos = data.sort((a, b) =>
          new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime()
        );
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get pedidosFiltrados(): Pedido[] {
    return this.pedidos.filter(p => {
      const coincideBusqueda =
        p.cliente?.nombre?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        p.id?.toString().includes(this.busqueda);
      const coincideEstado = this.filtroEstado === 'todos' || p.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  get contadores(): Record<string, number> {
    const estados = ['registrado', 'confirmado', 'en producción', 'listo', 'entregado'];
    const result: Record<string, number> = {};
    estados.forEach(e => {
      result[e] = this.pedidos.filter(p => p.estado === e).length;
    });
    return result;
  }

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
      error: (err) => {
        pedido.estado = estadoAnterior;
        this.errorBanner = err.error?.message || 'No se pudo cambiar el estado del pedido.';
      }
    });
  }

  // --- Modal Eliminación ---
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
        this.loadPedidos();
      },
      error: () => { this.eliminandoLoading = false; }
    });
  }
}
