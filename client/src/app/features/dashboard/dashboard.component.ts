import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats: DashboardStats = {
    totalClientes: 0,
    totalProductos: 0,
    totalIngresos: 0,
    ingresosDelMes: 0,
    pedidosPendientes: 0,
    pedidosEntregados: 0,
    cobrosPendientes: 0,
    estadosPedidos: {},
    recentOrders: [],
    topProducts: [],
    insumosStockBajo: [],
  };

  readonly estadoConfig: { key: string; label: string; clases: string; barra: string }[] = [
    { key: 'registrado',    label: 'Registrado',    clases: 'bg-gray-100 text-gray-700',    barra: 'bg-gray-400'   },
    { key: 'confirmado',    label: 'Confirmado',    clases: 'bg-blue-100 text-blue-700',    barra: 'bg-blue-400'   },
    { key: 'en producción', label: 'En producción', clases: 'bg-yellow-100 text-yellow-700', barra: 'bg-yellow-400' },
    { key: 'listo',         label: 'Listo',         clases: 'bg-purple-100 text-purple-700', barra: 'bg-purple-400' },
    { key: 'entregado',     label: 'Entregado',     clases: 'bg-green-100 text-green-700',  barra: 'bg-green-400'  },
  ];

  loading = true;
  error: string | null = null;
  userName = '';
  updatedText = '';

  private refreshInterval: any;
  private minuteInterval: any;
  private lastUpdated: Date | null = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.userName = user?.nombre?.split(' ')[0] ?? '';
    });

    this.loadStats();

    // Refresco automático cada 5 minutos
    this.refreshInterval = setInterval(() => {
      if (!this.loading) this.loadStats();
    }, 5 * 60 * 1000);

    // Actualiza el texto "hace X min" cada minuto
    this.minuteInterval = setInterval(() => this.updateUpdatedText(), 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.minuteInterval);
  }

  loadStats() {
    this.loading = true;
    this.error = null;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.lastUpdated = new Date();
        this.updateUpdatedText();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas. Intentá de nuevo.';
        this.loading = false;
      }
    });
  }

  private updateUpdatedText() {
    if (!this.lastUpdated) { this.updatedText = ''; return; }
    const diff = Math.floor((Date.now() - this.lastUpdated.getTime()) / 60_000);
    this.updatedText = diff === 0 ? 'Actualizado ahora mismo' : `Actualizado hace ${diff} min`;
  }

  // ── Saludo según hora del día ──────────────────────────────────────────────
  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  // ── Nombre del mes con mayúscula ───────────────────────────────────────────
  get mesActual(): string {
    const mes = new Date().toLocaleString('es-AR', { month: 'long' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }

  // ── Urgencia de fecha de entrega ───────────────────────────────────────────
  getDiasInfo(fecha: string | Date): { label: string; rowClases: string; labelClases: string } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fecha);
    entrega.setHours(0, 0, 0, 0);
    const diff = Math.round((entrega.getTime() - hoy.getTime()) / 86_400_000);

    if (diff < 0)  return { label: 'Vencido',    rowClases: 'bg-red-50',     labelClases: 'text-red-600 font-bold' };
    if (diff === 0) return { label: 'Hoy',        rowClases: 'bg-orange-50',  labelClases: 'text-orange-600 font-bold' };
    if (diff === 1) return { label: 'Mañana',     rowClases: '',              labelClases: 'text-yellow-600 font-semibold' };
    return           { label: `En ${diff} días`, rowClases: '',              labelClases: 'text-gray-500' };
  }

  // ── Barra proporcional de estados ─────────────────────────────────────────
  get totalEstados(): number {
    return Object.values(this.stats.estadosPedidos).reduce((a, b) => a + b, 0);
  }

  getPct(count: number): number {
    const total = this.totalEstados;
    return total === 0 ? 0 : Math.round((count / total) * 100);
  }
}
