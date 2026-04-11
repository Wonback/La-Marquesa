import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Producto } from '../../../core/services/product.service';

type FiltroTipo = 'todos' | 'elaborado' | 'simple';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;

  // Búsqueda y filtros
  busqueda = '';
  filtroTipo: FiltroTipo = 'todos';

  // Modal producción
  modalProduccionVisible = false;
  productoSeleccionado: Producto | null = null;
  cantidadAProducir = 1;
  produciendoLoading = false;
  errorProduccion: string | null = null;

  // Modal eliminación
  modalEliminarVisible = false;
  productoAEliminar: Producto | null = null;
  eliminandoLoading = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => { this.productos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get productosFiltrados(): Producto[] {
    return this.productos.filter(p => {
      const coincideNombre = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideTipo =
        this.filtroTipo === 'todos' ||
        (this.filtroTipo === 'elaborado' && p.es_elaborado) ||
        (this.filtroTipo === 'simple' && !p.es_elaborado);
      return coincideNombre && coincideTipo;
    });
  }

  tieneReceta(producto: Producto): boolean {
    return !!(producto.receta?.detallesReceta && producto.receta.detallesReceta.length > 0);
  }

  // --- Modal Producción ---
  abrirModalProduccion(producto: Producto) {
    this.productoSeleccionado = producto;
    this.cantidadAProducir = 1;
    this.errorProduccion = null;
    this.modalProduccionVisible = true;
  }

  cerrarModalProduccion() {
    this.modalProduccionVisible = false;
    this.productoSeleccionado = null;
    this.errorProduccion = null;
  }

  get insumosNecesarios() {
    if (!this.productoSeleccionado?.receta?.detallesReceta) return [];
    return this.productoSeleccionado.receta.detallesReceta.map(dr => ({
      nombre: dr.insumo.nombre,
      unidad: dr.insumo.unidad_medida,
      total: dr.cantidad * (this.cantidadAProducir || 0)
    }));
  }

  confirmarProduccion() {
    if (!this.productoSeleccionado?.id || this.cantidadAProducir <= 0) return;
    this.produciendoLoading = true;
    this.errorProduccion = null;
    this.productService.registrarProduccion(this.productoSeleccionado.id, this.cantidadAProducir).subscribe({
      next: () => {
        this.produciendoLoading = false;
        this.cerrarModalProduccion();
        this.loadProductos();
      },
      error: (err) => {
        this.produciendoLoading = false;
        this.errorProduccion = err.error?.message || 'Error al registrar la producción';
      }
    });
  }

  // --- Modal Eliminación ---
  abrirModalEliminar(producto: Producto) {
    this.productoAEliminar = producto;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.productoAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.productoAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.productService.delete(this.productoAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.loadProductos();
      },
      error: () => { this.eliminandoLoading = false; }
    });
  }
}
