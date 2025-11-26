import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeService, Receta } from '../../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-list.component.html'
})
export class RecipeListComponent implements OnInit {
  recetas: Receta[] = [];
  loading: boolean = true;

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadRecetas();
  }

  loadRecetas() {
    this.loading = true;
    this.recipeService.getAll().subscribe({
      next: (data) => {
        this.recetas = data;
        this.loading = false;
        // Debug: Descomenta esto si no ves ingredientes para ver qué llega del back
        // console.log(data); 
      },
      error: (err) => {
        console.error('Error cargando recetas', err);
        this.loading = false;
      }
    });
  }

  deleteReceta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta receta? Esto no eliminará el producto asociado.')) {
      this.recipeService.delete(id).subscribe(() => {
        this.loadRecetas();
      });
    }
  }
}