import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService, Insumo } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory-list.component.html'
})
export class InventoryListComponent implements OnInit {
  insumos: Insumo[] = [];
  loading: boolean = true;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadInsumos();
  }

  loadInsumos() {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.insumos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading inventory', err);
        this.loading = false;
      }
    });
  }

  deleteInsumo(id: number) {
    if (confirm('¿Estás seguro de eliminar este insumo?')) {
      this.inventoryService.delete(id).subscribe({
        next: () => {
          // Éxito: Recargamos la lista
          this.loadInsumos();
        },
        error: (err) => {
          // Manejo de error por clave foránea (FK)
          console.error('Error deleting insumo', err);
          alert('No se puede eliminar este insumo porque está siendo utilizado en una o más Recetas de productos.');
        }
      });
    }
  }
}