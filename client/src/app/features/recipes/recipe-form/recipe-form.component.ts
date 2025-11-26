import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../../core/services/recipe.service';
import { ProductService, Producto } from '../../../core/services/product.service';
import { InventoryService, Insumo } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.component.html'
})
export class RecipeFormComponent implements OnInit {
  recipeForm: FormGroup;
  isEditMode: boolean = false;
  recipeId: number | null = null;
  loading: boolean = false;
  error: string = '';

  productos: Producto[] = [];
  insumos: Insumo[] = [];

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private productService: ProductService,
    private inventoryService: InventoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeForm = this.fb.group({
      nombre: ['', [Validators.required]],
      producto_id: ['', [Validators.required]],
      descripcion: [''],
      // instrucciones: [''], // (Opcional, si lo agregaste al modelo backend)
      detallesReceta: this.fb.array([], [Validators.required]) // Requiere al menos 1
    });
  }

  get detalles() {
    return this.recipeForm.get('detallesReceta') as FormArray;
  }

  ngOnInit() {
    this.loadProductos();
    this.loadInsumos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.recipeId = Number(idParam);
      this.isEditMode = true;
      this.loadRecipe(this.recipeId);
    } else {
      this.addInsumo(); // Agregar uno por defecto al crear
    }
  }

  loadProductos() {
    this.productService.getAll().subscribe(data => {
      // Filtramos solo productos que requieren elaboración
      this.productos = data.filter(p => p.es_elaborado);
    });
  }

  loadInsumos() {
    this.inventoryService.getAll().subscribe(data => this.insumos = data);
  }

  loadRecipe(id: number) {
    this.loading = true;
    this.recipeService.getById(id).subscribe({
      next: (receta) => {
        this.recipeForm.patchValue({
          nombre: receta.nombre,
          producto_id: receta.producto_id,
          descripcion: receta.descripcion,
          // instrucciones: receta.instrucciones
        });

        this.detalles.clear();
        if (receta.detallesReceta) {
          receta.detallesReceta.forEach(detalle => {
            this.detalles.push(this.createDetalleGroup(detalle));
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar la receta.';
        this.loading = false;
      }
    });
  }

  createDetalleGroup(detalle?: any): FormGroup {
    return this.fb.group({
      insumo_id: [detalle?.insumo_id || '', [Validators.required]],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(0.01)]]
    });
  }

  addInsumo() {
    this.detalles.push(this.createDetalleGroup());
  }

  removeInsumo(index: number) {
    this.detalles.removeAt(index);
  }

  getUnidadMedida(index: number): string {
    const control = this.detalles.at(index).get('insumo_id');
    if (!control || !control.value) return ''; // Manejo seguro
    
    const insumoId = Number(control.value);
    const insumo = this.insumos.find(i => i.id === insumoId);
    return insumo ? insumo.unidad_medida : '';
  }

  onSubmit() {
    // Validación extra: Debe tener al menos un ingrediente
    if (this.detalles.length === 0) {
      this.error = "Debe agregar al menos un ingrediente a la receta.";
      return;
    }

    if (this.recipeForm.valid) {
      this.loading = true;
      this.error = '';
      const recipeData = this.recipeForm.value;

      const request = this.isEditMode
        ? this.recipeService.update(this.recipeId!, recipeData)
        : this.recipeService.create(recipeData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/recetas']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Ocurrió un error al guardar la receta.';
          this.loading = false;
        }
      });
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}