import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BillingService } from '../../../core/services/billing.service';
import { OrderService, Pedido } from '../../../core/services/order.service';

@Component({
  selector: 'app-billing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './billing-form.component.html'
})
export class BillingFormComponent implements OnInit {
  billingForm: FormGroup;
  isEditMode: boolean = false;
  cobroId: number | null = null;
  loading: boolean = false;
  error: string = '';

  pedidos: Pedido[] = [];
  maxMontoPermitido: number = 0;

  constructor(
    private fb: FormBuilder,
    private billingService: BillingService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.billingForm = this.fb.group({
      pedido_id: ['', [Validators.required]],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]], 
      metodo_pago: ['efectivo', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadPedidos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cobroId = Number(idParam);
      this.isEditMode = true;
      this.loadCobro(this.cobroId);
    }
  }

  loadPedidos() {
    this.orderService.getAll().subscribe(data => {
      // 1. Filtramos: Solo pedidos "listos"
      const pedidosListos = data.filter(p => p.estado === 'listo' || (this.isEditMode && p.id === this.billingForm.value.pedido_id));
      
      // 2. Calculamos el total para cada uno AQUÍ, para que se vea en el select
      this.pedidos = pedidosListos.map(p => ({
        ...p,
        total: this.calculateOrderTotal(p) // Forzamos el cálculo
      }));
    });
  }

  loadCobro(id: number) {
    this.loading = true;
    this.billingService.getById(id).subscribe({
      next: (cobro) => {
        const fechaFormateada = new Date(cobro.fecha).toISOString().split('T')[0];
        
        this.billingForm.patchValue({
          pedido_id: cobro.pedido_id,
          monto: cobro.monto,
          fecha: fechaFormateada,
          metodo_pago: cobro.metodo_pago
        });
        
        // Ejecutamos esto para setear el máximo permitido al editar
        this.onPedidoChange();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar el cobro';
        this.loading = false;
      }
    });
  }

  // Función que suma los subtotales de los productos
  calculateOrderTotal(pedido: Pedido): number {
    // Si ya tiene total guardado, lo usamos. Si no, sumamos el detalle.
    if (pedido.total && Number(pedido.total) > 0) return Number(pedido.total);
    
    return pedido.detallePedidos?.reduce((acc, item) => {
      const precio = Number(item.precio_unitario) || Number(item.producto?.precio) || 0;
      return acc + (Number(item.cantidad) * precio);
    }, 0) || 0;
  }

  onPedidoChange() {
    const pedidoId = this.billingForm.get('pedido_id')?.value;
    const pedido = this.pedidos.find(p => p.id == pedidoId);
    
    if (pedido) {
      // Usamos el total que ya calculamos en loadPedidos
      this.maxMontoPermitido = pedido.total || 0;

      // Seteamos el monto automáticamente
      this.billingForm.patchValue({ monto: this.maxMontoPermitido });

      // REGLA DE NEGOCIO: Validar que no pague más del total
      this.billingForm.get('monto')?.setValidators([
        Validators.required, 
        Validators.min(0.01), 
        Validators.max(this.maxMontoPermitido) // <--- Bloqueo aquí
      ]);
      this.billingForm.get('monto')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.billingForm.valid) {
      this.loading = true;
      this.error = '';
      const cobroData = this.billingForm.value;

      const request = this.isEditMode
        ? this.billingService.update(this.cobroId!, cobroData)
        : this.billingService.create(cobroData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/cobros']);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al registrar el cobro.';
          this.loading = false;
        }
      });
    } else {
      this.billingForm.markAllAsTouched();
    }
  }
}