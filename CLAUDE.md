# La Marquesa — Bakery Management System

## Stack
- **Frontend:** Angular 17+ standalone components, Tailwind CSS, `ng serve` on port 4200
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

## Pending Work
- **Fix 9 — Historial de estados:** Log each order state transition (estado_anterior, estado_nuevo, usuario, fecha) in a new `historial_pedidos` table. Backend: insert on `actualizarEstado`. Frontend: timeline widget in order form. Medium effort.

## Business Domain
- Orders (`pedidos`) flow: registrado → confirmado → en producción → listo → entregado
- Confirming an order deducts stock (insumos for elaborated products, direct stock for simple ones)
- `cliente_id` is nullable — orders without a registered client display as "Eventual"
- Billing (`cobros`) is created after an order reaches `listo`; marks order as `entregado`
