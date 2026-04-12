import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService, Cliente } from '../../../core/services/client.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = true;

  busqueda = '';

  modalEliminarVisible = false;
  clienteAEliminar: Cliente | null = null;
  eliminandoLoading = false;

  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private clientService: ClientService, private toast: ToastService) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: (data) => { this.clientes = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina));
  }

  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(n: number) {
    if (n >= 1 && n <= this.totalPaginas) this.paginaActual = n;
  }

  get clientesFiltrados(): Cliente[] {
    const q = this.busqueda.toLowerCase();
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefono?.toLowerCase().includes(q)
    );
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  abrirModalEliminar(cliente: Cliente) {
    this.clienteAEliminar = cliente;
    this.modalEliminarVisible = true;
  }

  cerrarModalEliminar() {
    this.modalEliminarVisible = false;
    this.clienteAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.clienteAEliminar?.id) return;
    this.eliminandoLoading = true;
    this.clientService.delete(this.clienteAEliminar.id).subscribe({
      next: () => {
        this.eliminandoLoading = false;
        this.cerrarModalEliminar();
        this.toast.success('Cliente eliminado correctamente.');
        this.loadClientes();
      },
      error: () => {
        this.eliminandoLoading = false;
        this.toast.error('No se pudo eliminar el cliente.');
      }
    });
  }
}
