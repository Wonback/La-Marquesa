import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService, Receta } from '../../../core/services/recipe.service';

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

  constructor(private recipeService: RecipeService) {}

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
        this.loadRecetas();
      },
      error: () => { this.eliminandoLoading = false; }
    });
  }
}
