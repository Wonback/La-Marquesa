import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean = false;
  productId: number | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      es_elaborado: [false]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productId = Number(idParam);
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getById(id).subscribe({
      next: (producto) => {
        this.productForm.patchValue(producto);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar la información del producto.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true;
      this.error = '';
      const productData = this.productForm.value;

      const request = this.isEditMode
        ? this.productService.update(this.productId!, productData)
        : this.productService.create(productData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/productos']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Ocurrió un error al guardar el producto.';
          this.loading = false;
        }
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}