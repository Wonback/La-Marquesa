# 🍞 La Marquesa - Sistema de Gestión ERP

**Grupo 8:** Franco de Iriondo, Mateo Zaballo, Gastón Nuñez, Jonas Mendelovich

---

## 📌 Descripción del Proyecto

**La Marquesa** es un sistema integral de gestión (ERP) diseñado específicamente para panaderías y pastelerías artesanales. El sistema digitaliza y optimiza el flujo completo de negocio, desde la gestión de inventario de materia prima hasta la venta y facturación final, pasando por la planificación de la producción basada en recetas.

### Problemas que resuelve:
- **Descontrol de Stock:** Evita quedarse sin ingredientes críticos mediante alertas de stock mínimo.
- **Estandarización:** Asegura la calidad del producto mediante recetas digitales estrictas.
- **Trazabilidad de Pedidos:** Monitorea el estado de cada pedido (desde "Registrado" hasta "Entregado").
- **Gestión Financiera:** Registro claro de cobros y métodos de pago.

---

## 🚀 Características Principales

- **🔐 Autenticación y Roles:** Sistema seguro con roles diferenciados (Admin, Ventas, Producción).
- **📦 Gestión de Inventario (Insumos):** Control de stock de materias primas (Harina, Azúcar, etc.) con unidades de medida.
- **🍰 Productos y Recetas:** 
  - Definición de productos para la venta.
  - Creación de recetas detalladas que vinculan productos con insumos.
  - Cálculo de costos (futuro) y requerimientos de materia prima.
- **🛒 Gestión de Pedidos:**
  - Carrito de compras para clientes.
  - Flujo de estados: *Registrado -> Confirmado -> En Producción -> Listo -> Entregado*.
- **💰 Facturación y Cobros:** Registro de pagos parciales o totales, soportando múltiples métodos de pago (Efectivo, Transferencia, Débito, Crédito).
- **📊 Dashboard:** Métricas en tiempo real sobre ventas, productos más vendidos y pedidos pendientes.

---

## 🧩 Arquitectura de Base de Datos

El sistema utiliza una base de datos relacional (PostgreSQL) gestionada por Sequelize ORM. A continuación se detalla el esquema de relaciones:

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nombre
        string email
        string password
        string rol "Admin, Ventas, Producción"
    }
    CLIENTE {
        int id PK
        string nombre
        string email
        string telefono
        string direccion
    }
    PEDIDO {
        int id PK
        date fecha_entrega
        enum estado "registrado, confirmado, en producción, listo, entregado"
        float total
    }
    DETALLE_PEDIDO {
        int id PK
        int cantidad
        float precio_unitario
        float subtotal
    }
    PRODUCTO {
        int id PK
        string nombre
        float precio
        int stock
        bool es_elaborado
    }
    RECETA {
        int id PK
        string nombre
        string descripcion
    }
    DETALLE_RECETA {
        int id PK
        float cantidad
    }
    INSUMO {
        int id PK
        string nombre
        float stock
        float stock_minimo
        string unidad_medida
    }
    COBRO {
        int id PK
        float monto
        date fecha
        enum metodo_pago
    }

    CLIENTE ||--o{ PEDIDO : realiza
    PEDIDO ||--|{ DETALLE_PEDIDO : contiene
    PRODUCTO ||--o{ DETALLE_PEDIDO : incluido_en
    PEDIDO ||--o{ COBRO : genera
    PRODUCTO ||--o| RECETA : tiene
    RECETA ||--|{ DETALLE_RECETA : especifica
    INSUMO ||--o{ DETALLE_RECETA : usado_en
```

---

## 🔄 Flujo de Vida del Sistema

El siguiente diagrama ilustra el ciclo de vida operativo de "La Marquesa", desde la configuración inicial hasta la entrega del producto al cliente.

```mermaid
graph TD
    subgraph Configuración
    A[Inicio] --> B(Crear Insumos)
    B --> C(Crear Productos)
    C --> D{Es Elaborado?}
    D -- Si --> E[Crear Receta]
    E --> F[Asignar Insumos a Receta]
    D -- No --> G[Producto Listo para Venta]
    F --> G
    end

    subgraph Ventas
    H[Cliente Solicita Pedido] --> I[Registrar Cliente]
    I --> J[Crear Pedido]
    J --> K[Estado: REGISTRADO]
    end

    subgraph Producción
    K --> L{Confirmar?}
    L -- Si --> M[Estado: CONFIRMADO]
    M --> N[Estado: EN PRODUCCIÓN]
    N --> O[Elaboración en Cocina]
    O --> P[Estado: LISTO]
    end

    subgraph Entrega y Cobro
    P --> Q[Cliente Retira / Envío]
    Q --> R[Registrar Cobro]
    R --> S[Estado: ENTREGADO]
    S --> T((Fin del Ciclo))
    end

    G -.-> J
```

---

## 💻 Guía de Instalación y Uso

Sigue estos pasos para levantar el proyecto en tu entorno local.

### Prerrequisitos
- **Node.js** (v18 o superior)
- **PostgreSQL** (Base de datos corriendo localmente o en la nube)

### 1. Clonar y Configurar
Clona el repositorio y navega a la carpeta raíz.

### 2. Configuración del Servidor (`/server`)

```bash
cd server
npm install
```

Crea un archivo `.env` en la carpeta `server` con las siguientes variables:
```env
PORT=4000
DATABASE_URL=postgres://usuario:password@localhost:5432/la_marquesa_db
JWT_SECRET=tu_secreto_super_seguro
NODE_ENV=development
```

### 3. Configuración del Cliente (`/client`)

```bash
cd ../client
npm install
```

### 4. Inicialización de Base de Datos (Seed)
El proyecto incluye un script de "semilla" (`seed.ts`) que:
1. Borra y recrea las tablas (Sincronización forzada).
2. Crea usuarios por defecto (Admin, Ventas).
3. Carga insumos, productos y recetas de ejemplo.
4. Genera pedidos y cobros simulados.

**Para ejecutarlo:**
```bash
# Desde la carpeta /server
npm run seed
```
> **⚠️ Nota:** Esto borrará cualquier dato existente en la base de datos configurada.

### 5. Ejecutar el Proyecto

Necesitarás dos terminales:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```

Abre tu navegador en `http://localhost:4200`.

### 6. Credenciales de Acceso (Seed)
Si usaste el seed, puedes ingresar con:
- **Email:** `admin@lamarquesa.com`
- **Password:** `admin123`

---

## 🛠 Stack Tecnológico

- **Frontend:** Angular 16+, TailwindCSS, FontAwesome.
- **Backend:** Node.js, Express, TypeScript.
- **Base de Datos:** PostgreSQL, Sequelize ORM.
- **Herramientas:** JWT para autenticación, Faker.js para datos de prueba.
