import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService, Cliente } from '../../../core/services/client.service';

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

  constructor(private clientService: ClientService) {}

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
        this.loadClientes();
      },
      error: () => { this.eliminandoLoading = false; }
    });
  }
}
