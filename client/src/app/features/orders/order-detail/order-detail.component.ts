import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Pedido, HistorialPedido } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  pedido: Pedido | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe({
      next: (data) => {
        this.pedido = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el pedido.';
        this.loading = false;
      },
    });
  }

  get historial(): HistorialPedido[] {
    return this.pedido?.historialPedidos ?? [];
  }

  get total(): number {
    return this.pedido?.detallePedidos?.reduce((acc, d) => {
      return acc + (Number(d.precio_unitario) || 0) * Number(d.cantidad);
    }, 0) ?? 0;
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      'registrado':    'bg-gray-100 text-gray-700 border-gray-200',
      'confirmado':    'bg-blue-100 text-blue-700 border-blue-200',
      'en producción': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'listo':         'bg-purple-100 text-purple-700 border-purple-200',
      'entregado':     'bg-green-100 text-green-700 border-green-200',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-600';
  }

  estadoIcono(estado: string): string {
    const map: Record<string, string> = {
      'registrado':    'fa-file-alt',
      'confirmado':    'fa-check',
      'en producción': 'fa-cog',
      'listo':         'fa-box',
      'entregado':     'fa-truck',
    };
    return map[estado] ?? 'fa-circle';
  }
}
