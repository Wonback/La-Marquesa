import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Pedido } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html'
})
export class OrderListComponent implements OnInit {
  pedidos: Pedido[] = [];
  loading: boolean = true;

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
      error: (err) => {
        console.error('Error loading orders', err);
        this.loading = false;
      }
    });
  }

  getStatusColor(estado: string): string {
    const status = estado?.toLowerCase() || '';
    switch (status) {
      case 'registrado': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'confirmado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en producción': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'listo': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  calculateTotal(pedido: Pedido): number {
    // Si el backend ya manda el total (lo agregamos en el seed), úsalo.
    if (pedido.total !== undefined && Number(pedido.total) > 0) {
        return Number(pedido.total);
    }
    
    // Fallback: calcular sumando detalles
    return pedido.detallePedidos?.reduce((acc, item) => {
      const precio = Number(item.precio_unitario) || Number(item.producto?.precio) || 0;
      return acc + (Number(item.cantidad) * precio);
    }, 0) || 0;
  }

  // Función inteligente para avanzar al siguiente estado lógico
  avanzarEstado(pedido: Pedido) {
    if (!pedido.id) return;

    let nuevoEstado = '';
    switch (pedido.estado) {
        case 'registrado': nuevoEstado = 'confirmado'; break;
        case 'confirmado': nuevoEstado = 'en producción'; break;
        case 'en producción': nuevoEstado = 'listo'; break;
        case 'listo': nuevoEstado = 'entregado'; break; // Ojo: Entregado suele ser por Cobro
        default: return; // No avanza más
    }

    // Si el estado es 'listo', avisar que el siguiente paso es cobrar
    if (pedido.estado === 'listo') {
        alert('El pedido ya está listo. Para pasarlo a "Entregado", regístrelo en la sección de COBROS.');
        return;
    }

    this.cambiarEstado(pedido, nuevoEstado);
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    if (!pedido.id) return;

    const estadoAnterior = pedido.estado;
    // Optimista: Cambiamos visualmente ya
    pedido.estado = nuevoEstado as any; 

    this.orderService.updateStatus(pedido.id, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        console.log('Estado actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al cambiar estado', err);
        // Revertimos si falla (ej: falta stock)
        pedido.estado = estadoAnterior; 
        alert('No se pudo cambiar el estado: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  deletePedido(id: number) {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      this.orderService.delete(id).subscribe(() => {
        this.loadPedidos();
      });
    }
  }
}