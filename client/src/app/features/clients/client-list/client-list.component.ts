import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService, Cliente } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading: boolean = true;

  constructor(private clientService: ClientService) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clients', err);
        this.loading = false;
      }
    });
  }

  deleteCliente(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente? Se perderá su historial de pedidos.')) {
      this.clientService.delete(id).subscribe(() => {
        this.loadClientes();
      });
    }
  }

  // Función auxiliar para extraer iniciales (ej: "Maria Lopez" -> "ML")
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}