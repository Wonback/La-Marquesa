import { Component, OnInit, OnDestroy, afterNextRender, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

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
    topProductsMes: [],
    topProductsAno: [],
    topProductsHistorico: [],
    insumosStockBajo: [],
    ingresosMesAnterior: 0,
    ingresosSemanaActual: 0,
    ingresosSemanaAnterior: 0,
    ticketPromedio: 0,
    pedidosDelMes: 0,
    tasaCompletitud: 0,
    tiempoPromedioProduccion: null,
    pedidosVencenHoy: 0,
    pedidosVencidos: 0,
    clientesFrecuentes: [],
    pedidosSinCobrar: [],
    ingresosPorMes: [],
    pedidosPorDia: [],
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
  private chartIngresos: Chart | null = null;
  private chartPedidos: Chart | null = null;
  private domReady = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {
    afterNextRender(() => {
      this.domReady = true;
      if (!this.loading) this.renderCharts();
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.userName = user?.nombre?.split(' ')[0] ?? '';
    });

    this.loadStats();

    this.refreshInterval = setInterval(() => {
      if (!this.loading) this.loadStats();
    }, 5 * 60 * 1000);

    this.minuteInterval = setInterval(() => this.updateUpdatedText(), 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.minuteInterval);
    this.chartIngresos?.destroy();
    this.chartPedidos?.destroy();
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
        if (this.domReady) this.renderCharts();
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas. Intentá de nuevo.';
        this.loading = false;
      },
    });
  }

  private renderCharts() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.renderIngresosChart();
    this.renderPedidosChart();
  }

  private renderIngresosChart() {
    const canvas = document.getElementById('chartIngresos') as HTMLCanvasElement | null;
    if (!canvas) return;

    // Rellenar meses faltantes en los últimos 12
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const found = this.stats.ingresosPorMes.find(r => r.mes === key);
      labels.push(d.toLocaleString('es-AR', { month: 'short', year: '2-digit' }));
      data.push(found ? found.ingresos : 0);
    }

    if (this.chartIngresos) {
      this.chartIngresos.data.labels = labels;
      (this.chartIngresos.data.datasets[0] as any).data = data;
      this.chartIngresos.update();
      return;
    }

    this.chartIngresos = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${Number(ctx.raw).toLocaleString('es-AR')}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: (v) => `$${Number(v).toLocaleString('es-AR', { notation: 'compact' })}`,
              font: { size: 11 },
            },
          },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  private renderPedidosChart() {
    const canvas = document.getElementById('chartPedidos') as HTMLCanvasElement | null;
    if (!canvas) return;

    // Rellenar días faltantes en los últimos 30
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const found = this.stats.pedidosPorDia.find(r => r.dia === key);
      labels.push(d.getDate() === 1 || i === 29
        ? d.toLocaleString('es-AR', { day: '2-digit', month: 'short' })
        : String(d.getDate()));
      data.push(found ? found.cantidad : 0);
    }

    if (this.chartPedidos) {
      this.chartPedidos.data.labels = labels;
      (this.chartPedidos.data.datasets[0] as any).data = data;
      this.chartPedidos.update();
      return;
    }

    this.chartPedidos = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Pedidos',
          data,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { stepSize: 1, font: { size: 11 } },
          },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        },
      },
    });
  }

  private updateUpdatedText() {
    if (!this.lastUpdated) { this.updatedText = ''; return; }
    const diff = Math.floor((Date.now() - this.lastUpdated.getTime()) / 60_000);
    this.updatedText = diff === 0 ? 'Actualizado ahora mismo' : `Actualizado hace ${diff} min`;
  }

  // ── Helpers de crecimiento ──────────────────────────────────────────────────
  crecimientoMes(): number {
    if (!this.stats.ingresosMesAnterior) return 0;
    return Math.round(((this.stats.ingresosDelMes - this.stats.ingresosMesAnterior) / this.stats.ingresosMesAnterior) * 100);
  }

  crecimientoSemana(): number {
    if (!this.stats.ingresosSemanaAnterior) return 0;
    return Math.round(((this.stats.ingresosSemanaActual - this.stats.ingresosSemanaAnterior) / this.stats.ingresosSemanaAnterior) * 100);
  }

  badgeCrecimiento(pct: number): string {
    if (pct > 0) return 'bg-emerald-100 text-emerald-700';
    if (pct < 0) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  }

  // ── Saludo ──────────────────────────────────────────────────────────────────
  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get mesActual(): string {
    const mes = new Date().toLocaleString('es-AR', { month: 'long' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }

  // ── Urgencia de fecha ───────────────────────────────────────────────────────
  getDiasInfo(fecha: string | Date): { label: string; rowClases: string; labelClases: string } {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fecha); entrega.setHours(0, 0, 0, 0);
    const diff = Math.round((entrega.getTime() - hoy.getTime()) / 86_400_000);
    if (diff < 0)   return { label: 'Vencido',       rowClases: 'bg-red-50',    labelClases: 'text-red-600 font-bold' };
    if (diff === 0) return { label: 'Hoy',            rowClases: 'bg-orange-50', labelClases: 'text-orange-600 font-bold' };
    if (diff === 1) return { label: 'Mañana',         rowClases: 'bg-yellow-50', labelClases: 'text-yellow-600 font-semibold' };
    return                 { label: `En ${diff} días`, rowClases: '',            labelClases: 'text-gray-500' };
  }

  // ── Barra de estados ────────────────────────────────────────────────────────
  get totalEstados(): number {
    return Object.values(this.stats.estadosPedidos).reduce((a, b) => a + b, 0);
  }

  getPct(count: number): number {
    return this.totalEstados === 0 ? 0 : Math.round((count / this.totalEstados) * 100);
  }

  // ── Filtro top productos ────────────────────────────────────────────────────
  filtroTopProducts: 'mes' | 'año' | 'historico' = 'mes';

  get topProductsFiltrados(): any[] {
    if (this.filtroTopProducts === 'mes')      return this.stats.topProductsMes;
    if (this.filtroTopProducts === 'año')      return this.stats.topProductsAno;
    return this.stats.topProductsHistorico;
  }

  // ── Total pedidos sin cobrar ────────────────────────────────────────────────
  get totalSinCobrar(): number {
    return this.stats.pedidosSinCobrar.reduce((acc, p) => acc + p.montoEstimado, 0);
  }
}
