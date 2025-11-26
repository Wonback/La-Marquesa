import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode: boolean = false;
  clientId: number | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      // Validaciones: Nombre requerido, Email con formato válido
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      localidad: ['']
    });
  }

  ngOnInit() {
    // Detectamos si hay un ID en la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.clientId = Number(idParam);
      this.isEditMode = true;
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number) {
    this.loading = true;
    this.clientService.getById(id).subscribe({
      next: (cliente) => {
        // patchValue rellena el formulario con los datos que coincidan
        this.clientForm.patchValue(cliente);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar la información del cliente.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.loading = true;
      this.error = ''; // Limpiar errores previos
      const clientData = this.clientForm.value;

      const request = this.isEditMode
        ? this.clientService.update(this.clientId!, clientData)
        : this.clientService.create(clientData);

      request.subscribe({
        next: () => {
          // Redirigir a la lista tras guardar
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Ocurrió un error al guardar los datos. Intente nuevamente.';
          this.loading = false;
        }
      });
    } else {
      // Si el usuario fuerza el envío, marcamos todo como "tocado" para mostrar errores rojos
      this.clientForm.markAllAsTouched();
    }
  }
}