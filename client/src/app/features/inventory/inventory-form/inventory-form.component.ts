import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inventory-form.component.html'
})
export class InventoryFormComponent implements OnInit {
  inventoryForm: FormGroup;
  isEditMode: boolean = false;
  insumoId: number | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.inventoryForm = this.fb.group({
      nombre: ['', [Validators.required]],
      unidad_medida: ['u', [Validators.required]], // Valor por defecto 'u'
      stock: [0, [Validators.required, Validators.min(0)]], // <--- CORREGIDO: era 'stock_actual'
      stock_minimo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.insumoId = Number(idParam);
      this.isEditMode = true;
      this.loadInsumo(this.insumoId);
    }
  }

  loadInsumo(id: number) {
    this.loading = true;
    this.inventoryService.getById(id).subscribe({
      next: (insumo) => {
        this.inventoryForm.patchValue(insumo);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar la información del insumo.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.inventoryForm.valid) {
      this.loading = true;
      this.error = '';
      const insumoData = this.inventoryForm.value;

      const request = this.isEditMode
        ? this.inventoryService.update(this.insumoId!, insumoData)
        : this.inventoryService.create(insumoData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/insumos']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Ocurrió un error al guardar el insumo.';
          this.loading = false;
        }
      });
    } else {
      this.inventoryForm.markAllAsTouched();
    }
  }
}