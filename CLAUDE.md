# La Marquesa — Bakery Management System

## Stack
- **Frontend:** Angular 20 standalone components, Tailwind CSS, `ng serve` on port 4200
- **Backend:** Express + Sequelize ORM, PostgreSQL, `npm run dev` on port 4000
- **Auth:** JWT stored in localStorage; functional interceptor in `app.config.ts`

## Dev Commands
- `cd client && npm start` — Angular dev server
- `cd server && npm run dev` — Express server
- `cd server && npm run seed` — Seed the database

## Architecture Notes
- HTTP calls go through `ApiService` (not raw `HttpClient`) — it injects the Bearer token
- `ToastService` is global; inject it in any component for success/error feedback
- `sync({ force: false })` on startup — schema changes require manual `ALTER TABLE` or a one-time `sync({ alter: true })`
- All list components have client-side pagination (10 items/page); getter pattern: `xyzFiltrados` → `xyzPaginados`

## Gotchas
- Angular class field initializers run before the constructor — use `inject()` instead of constructor injection when assigning `field = this.service.value`
- `sequelize.sync({ force: false })` does NOT alter existing columns; run raw SQL for constraint changes (e.g. `ALTER TABLE pedidos ALTER COLUMN cliente_id DROP NOT NULL`)
- Windows CRLF line endings (`\r\n`) can break `Edit` tool string matching — use line-level edits when context spans multiple lines
- Dashboard endpoint requires `authenticateJWT`; use `ApiService` not raw `HttpClient` to ensure token is sent
- DOM access in SSR: use `afterNextRender(() => { ... })` (Angular 17+) instead of `isPlatformBrowser` guards for one-time post-render logic
- Sequelize `include` objects do NOT support an `order` property — sort associated records via the parent query's `order` array or in the frontend
- `Pedido` has `timestamps: false` — no `createdAt`; use `historial_pedidos WHERE estado_nuevo = 'registrado'` to get order creation dates
- Orders are only editable in `registrado` state; Admin can revert `confirmado`/`en producción`/`listo` → `registrado` via `PUT /pedidos/:id/revertir`, which also restores deducted stock
- Frontend role check: `JSON.parse(localStorage.getItem('user') || '{}')?.rol` — no dedicated method on AuthService
- Stock reversion (revertirPedido) is the exact mirror of the confirmation discount — if confirmation logic changes, reversion must change in sync

## Roadmap — Fase SaaS

### Prioridad alta (infraestructura bloqueante)
- **Multi-tenancy:** tabla `panaderias`, campo `panaderia_id` en todos los recursos; cada usuario pertenece a una panadería y solo ve su data.
- **Seguridad:** refresh tokens (JWT actual dura 8h sin revocación), rate limiting en `/auth/login`, validación de inputs en el backend.
- **Onboarding:** registro de panadería + usuario Admin inicial; pantalla de bienvenida con seed guiado para usuarios nuevos.
- **Migraciones:** reemplazar `sync({ alter })` por migraciones versionadas (Sequelize CLI) aplicables sin downtime.

### Prioridad media (valor diferencial)
- **Planes y suscripción:** límites por plan (usuarios, productos, pedidos/mes), integración Mercado Pago, página de pricing y gestión de plan desde el panel.
- **Gestión de usuarios por panadería:** cada panadería administra sus propios usuarios con roles internos; invitación por email.
- **Reportes y exportación:** ventas por período, productos más vendidos, exportación a Excel/CSV.
- **Dashboard expandido** — ✅ implementado (Chart.js bar+line, 6 KPIs con %, alertas operacionales, clientes frecuentes, pedidos sin cobrar, acciones rápidas). Pendiente: selector de período, exportar reporte, donut chart comparativo.

### Prioridad baja (experiencia y retención)
- **Notificaciones:** alertas de pedidos vencidos, stock bajo mínimo y confirmaciones vía WhatsApp (Twilio/Meta API) o email.
- **Mobile:** optimizar la UI para celular; los operarios de producción suelen usar el teléfono.

## Business Domain
- Orders (`pedidos`) flow: registrado → confirmado → en producción → listo → entregado
- Confirming an order deducts stock (insumos for elaborated products, direct stock for simple ones)
- `cliente_id` is nullable — orders without a registered client display as "Eventual"
- Billing (`cobros`) is created after an order reaches `listo`; marks order as `entregado`
