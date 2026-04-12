import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService, Receta } from '../../../core/services/recipe.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recipe-list.component.html'
})
export class RecipeListComponent implements OnInit {
  recetas: Receta[] = [];
  loading = true;

  busqueda = '';

  modalEliminarVisible = false;
  recetaAEliminar: Receta | null = null;
  eliminandoLoading = false;

  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private recipeService: RecipeService, private toast: ToastService) {}

  ngOnInit() {
    this.loadRecetas();
  }

  loadRecetas() {
    this.loading = true;
    this.recipeService.getAll().subscribe({
      next: (data) => { this.recetas = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.recetasFiltradas.length / this.itemsPorPagina));
  }

  get recetasPaginadas(): Receta[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.recetasFiltradas.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(n: number) {
    if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n;
  }

  get recetasFiltradas(): Receta[] {
    const q = this.busqueda.toLowerCase();
    return this.recetas.filter(r =>
      r.nombre?.toLowerCase().includes(q) ||
      r.producto?.nombre.toLowerCase().includes(q)
    );
  }

  abrirModalEliminar(receta: Receta) {
    this.recetaAEliminar = receta;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.recetaAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.recetaAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.recipeService.delete(this.recetaAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.toast.success('Receta eliminada correctamente.');
        this.loadRecetas();
      },
      error: () => {
        this.eliminandoLoading = false;
        this.toast.error('No se pudo eliminar la receta.');
      }
    });
  }
}
