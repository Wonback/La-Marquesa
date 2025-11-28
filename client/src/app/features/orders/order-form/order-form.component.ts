import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ClientService, Cliente } from '../../../core/services/client.service';
import { ProductService, Producto } from '../../../core/services/product.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.component.html'
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  isEditMode: boolean = false;
  orderId: number | null = null;
  loading: boolean = false;
  error: string = '';
  total: number = 0;

  clientes: Cliente[] = [];
  productos: Producto[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private clientService: ClientService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.orderForm = this.fb.group({
      cliente_id: ['', [Validators.required]],
      fecha_entrega: ['', [Validators.required]],
      // Estado inicial por defecto 'registrado'
      estado: ['registrado', [Validators.required]], 
      // Array de productos
      productos: this.fb.array([], [Validators.required]) 
    });
  }

  // Getter para acceder fácil al array en el HTML
  get productosArray() {
    return this.orderForm.get('productos') as FormArray;
  }

  ngOnInit() {
    this.loadClientes();
    this.loadProductos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.orderId = Number(idParam);
      this.isEditMode = true;
      this.loadOrder(this.orderId);
    } else {
      this.addProduct(); // Agregar una fila vacía al empezar
    }
  }

  loadClientes() {
    this.clientService.getAll().subscribe(data => this.clientes = data);
  }

  loadProductos() {
    this.productService.getAll().subscribe(data => this.productos = data);
  }

  loadOrder(id: number) {
    this.loading = true;
    this.orderService.getById(id).subscribe({
      next: (pedido) => {
        // Formatear fecha para input date (yyyy-MM-dd)
        const fechaEntrega = new Date(pedido.fecha_entrega).toISOString().split('T')[0];

        this.orderForm.patchValue({
          cliente_id: pedido.cliente_id,
          fecha_entrega: fechaEntrega,
          estado: pedido.estado
        });

        this.productosArray.clear();
        if (pedido.detallePedidos) {
          pedido.detallePedidos.forEach(detalle => {
            const group = this.createProductGroup(detalle);
            this.productosArray.push(group);
          });
        }
        this.updateTotal();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar el pedido';
        this.loading = false;
      }
    });
  }

  createProductGroup(detalle?: any): FormGroup {
    return this.fb.group({
      producto_id: [detalle?.producto_id || '', [Validators.required]],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      // Guardamos el precio histórico o 0 si es nuevo 
      precio_unitario: [detalle?.precio_unitario || 0] 
    });
  }

  addProduct() {
    this.productosArray.push(this.createProductGroup());
  }

  removeProduct(index: number) {
    this.productosArray.removeAt(index);
    this.updateTotal();
  }

  // EVENTO CLAVE: Cuando cambian el producto en el select
  onProductoChange(index: number) {
    const group = this.productosArray.at(index);
    const prodId = group.get('producto_id')?.value;
    
    const producto = this.productos.find(p => p.id == prodId);
    if (producto) {
      // Actualizamos el precio unitario oculto para cálculos
      group.patchValue({ precio_unitario: producto.precio });
      this.updateTotal();
    }
  }

  // EVENTO: Cuando cambian la cantidad
  onQuantityChange() {
    this.updateTotal();
  }

  updateTotal() {
    this.total = this.productosArray.controls.reduce((acc, control) => {
      const cant = control.get('cantidad')?.value || 0;
      const precio = control.get('precio_unitario')?.value || 0;
      return acc + (cant * precio);
    }, 0);
  }

  calculateSubtotal(index: number): number {
    const control = this.productosArray.at(index);
    const cant = control.get('cantidad')?.value || 0;
    const precio = control.get('precio_unitario')?.value || 0;
    return cant * precio;
  }

  onSubmit() {
    if (this.productosArray.length === 0) {
      this.error = "Debe agregar al menos un producto.";
      return;
    }

    if (this.orderForm.valid) {
      this.loading = true;
      this.error = ''; // Limpiar errores previos

      // Estructura final que espera el backend
      const orderData = {
        ...this.orderForm.value,
        productos: this.productosArray.value // El back espera "productos" array
      };

      // CORRECCIÓN: Usamos .update() para enviar el contenido completo
      const request = this.isEditMode
        ? this.orderService.update(this.orderId!, orderData) 
        : this.orderService.create(orderData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/pedidos']);
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.message || 'Error al guardar el pedido.';
          this.loading = false;
        }
      });
    } else {
      this.orderForm.markAllAsTouched();
    }
  }
}