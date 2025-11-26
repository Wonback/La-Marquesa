import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { 
        path: 'clientes', 
        loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent) 
      },
      { 
        path: 'clientes/nuevo', 
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent) 
      },
      { 
        path: 'clientes/editar/:id', 
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent) 
      },
      { 
        path: 'productos', 
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) 
      },
      { 
        path: 'productos/nuevo', 
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) 
      },
      { 
        path: 'productos/editar/:id', 
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent) 
      },
      { 
        path: 'pedidos', 
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent) 
      },
      { 
        path: 'pedidos/nuevo', 
        loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent) 
      },
      { 
        path: 'pedidos/editar/:id', 
        loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent) 
      },
      { 
        path: 'insumos', 
        loadComponent: () => import('./features/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent) 
      },
      { 
        path: 'insumos/nuevo', 
        loadComponent: () => import('./features/inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent) 
      },
      { 
        path: 'insumos/editar/:id', 
        loadComponent: () => import('./features/inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent) 
      },
      { 
        path: 'recetas', 
        loadComponent: () => import('./features/recipes/recipe-list/recipe-list.component').then(m => m.RecipeListComponent) 
      },
      { 
        path: 'recetas/nuevo', 
        loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent) 
      },
      { 
        path: 'recetas/editar/:id', 
        loadComponent: () => import('./features/recipes/recipe-form/recipe-form.component').then(m => m.RecipeFormComponent) 
      },
      { 
        path: 'cobros', 
        loadComponent: () => import('./features/billing/billing-list/billing-list.component').then(m => m.BillingListComponent) 
      },
      { 
        path: 'cobros/nuevo', 
        loadComponent: () => import('./features/billing/billing-form/billing-form.component').then(m => m.BillingFormComponent) 
      },
      { 
        path: 'cobros/editar/:id', 
        loadComponent: () => import('./features/billing/billing-form/billing-form.component').then(m => m.BillingFormComponent) 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      // Other feature routes will go here
    ]
  },
  { path: '**', redirectTo: 'login' }
];
