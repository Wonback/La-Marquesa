import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, Insumo } from '../../../core/services/inventory.service';
import { ToastService } from '../../../core/services/toast.service';

type FiltroEstado = 'todos' | 'critico' | 'bajo' | 'normal';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inventory-list.component.html'
})
export class InventoryListComponent implements OnInit {
  insumos: Insumo[] = [];
  loading = true;

  busqueda = '';
  filtroEstado: FiltroEstado = 'todos';

  // Modal reposición
  modalReponerVisible = false;
  insumoSeleccionado: Insumo | null = null;
  cantidadAReponer = 1;
  reponerLoading = false;
  errorReponer: string | null = null;

  // Modal eliminación
  modalEliminarVisible = false;
  insumoAEliminar: Insumo | null = null;
  eliminandoLoading = false;
  errorEliminar: string | null = null;

  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private inventoryService: InventoryService, private toast: ToastService) {}

  ngOnInit() {
    this.loadInsumos();
  }

  loadInsumos() {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: (data) => { this.insumos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getEstado(insumo: Insumo): FiltroEstado {
    if (insumo.stock <= insumo.stock_minimo) return 'critico';
    if (insumo.stock <= insumo.stock_minimo * 1.2) return 'bajo';
    return 'normal';
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.insumosFiltrados.length / this.itemsPorPagina));
  }

  get insumosPaginados(): Insumo[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.insumosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(n: number) {
    if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n;
  }

  get insumosFiltrados(): Insumo[] {
    return this.insumos.filter(i => {
      const coincideNombre = i.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = this.filtroEstado === 'todos' || this.getEstado(i) === this.filtroEstado;
      return coincideNombre && coincideEstado;
    });
  }

  get contadores() {
    return {
      critico: this.insumos.filter(i => this.getEstado(i) === 'critico').length,
      bajo:    this.insumos.filter(i => this.getEstado(i) === 'bajo').length,
      normal:  this.insumos.filter(i => this.getEstado(i) === 'normal').length,
    };
  }

  // --- Modal Reposición ---
  abrirModalReponer(insumo: Insumo) {
    this.insumoSeleccionado = insumo;
    this.cantidadAReponer = 1;
    this.errorReponer = null;
    this.modalReponerVisible = true;
  }

  cerrarModalReponer() {
    this.modalReponerVisible = false;
    this.insumoSeleccionado = null;
    this.errorReponer = null;
  }

  confirmarReponer() {
    if (!this.insumoSeleccionado?.id || this.cantidadAReponer <= 0) return;
    this.reponerLoading = true;
    this.errorReponer = null;
    this.inventoryService.reponerStock(this.insumoSeleccionado.id, this.cantidadAReponer).subscribe({
      next: () => {
        this.reponerLoading = false;
        this.cerrarModalReponer();
        this.toast.success(`Stock repuesto correctamente (+${this.cantidadAReponer}).`);
        this.loadInsumos();
      },
      error: (err) => {
        this.reponerLoading = false;
        this.errorReponer = err.error?.message || 'Error al reponer el stock';
        this.toast.error(this.errorReponer!);
      }
    });
  }

  // --- Modal Eliminación ---
  abrirModalEliminar(insumo: Insumo) {
    this.insumoAEliminar = insumo;
    this.errorEliminar = null;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.insumoAEliminar = null;
    this.errorEliminar = null;
  }

  confirmarEliminar() {
    if (!this.insumoAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.errorEliminar = null;
    this.inventoryService.delete(this.insumoAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.toast.success('Insumo eliminado correctamente.');
        this.loadInsumos();
      },
      error: () => {
        this.eliminandoLoading = false;
        this.errorEliminar = 'No se puede eliminar este insumo porque está siendo utilizado en una o más recetas.';
        this.toast.error(this.errorEliminar);
      }
    });
  }
}
