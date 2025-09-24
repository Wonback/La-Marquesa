
# La Marquesa - Panificación

Trabajo práctico de **Metodología en Sistemas 2**  
**Grupo 8:**  
- Franco de Iriondo  
- Mateo Zaballo  
- Gastón Nuñez  
- Jonas Mendelovich  

---

## Descripción del proyecto

La panadería **“La Marquesa”** actualmente funciona con un sistema manual y desorganizado para gestionar pedidos personalizados de sus clientes (como tortas decoradas, productos sin gluten o encargos grandes para eventos). Esto genera problemas como pérdida de pedidos, errores en fechas, confusiones con ingredientes y olvidos en la reposición de insumos.

Este proyecto consiste en un **sistema informático completo** que permite:

- Registrar y gestionar pedidos personalizados.
- Controlar y actualizar el stock de insumos.
- Notificar automáticamente al cliente sobre el estado de su pedido.
- Gestionar usuarios y roles con distintos niveles de acceso.
- Controlar cobros, facturas y producción de productos elaborados.

El objetivo es optimizar tiempos, evitar errores y mejorar el servicio al cliente.

---

## Dominio del sistema

- **Gestión de pedidos personalizados, stock y ventas de insumos** en la panadería “La Marquesa”.

### Flujo de negocio

1. **Recepción del pedido:**  
   - Puede ser presencial, telefónico o por WhatsApp.  
   - Se registra en el sistema con cliente, productos y fecha de entrega.

2. **Control de insumos:**  
   - Se verifica automáticamente la disponibilidad de insumos para productos elaborados.  
   - Alertas automáticas si algún insumo está por debajo del stock mínimo.

3. **Producción:**  
   - Los empleados de producción confirman cuando los productos elaborados están listos.  

4. **Cobro y entrega:**  
   - El cliente abona el pedido al retirarlo.  
   - Se genera un comprobante detallado con método de pago.

---

## Reglas de negocio

- Cada pedido debe estar asociado a un único cliente y contener al menos un producto.  
- El pedido se puede modificar hasta 24 horas antes de la fecha de entrega.  
- Los productos elaborados requieren recetas y disponibilidad de insumos.  
- Estados posibles de un pedido: `registrado`, `confirmado`, `en producción`, `listo`, `entregado`.  
- Métodos de pago aceptados: efectivo, tarjeta de débito, tarjeta de crédito y transferencia bancaria.

---

## Clases conceptuales

| Clase | Descripción |
|-------|-------------|
| Cliente | Persona que realiza pedidos. Puede tener múltiples pedidos. |
| Pedido | Encargo realizado por un cliente. Contiene productos, fecha de entrega y estado. |
| DetallePedido | Ítem específico de un pedido (producto, cantidad, observaciones). |
| Producto | Artículo del catálogo, puede ser elaborado o de reventa. |
| Receta | Conjunto de pasos e insumos para un producto elaborado. |
| DetalleReceta | Asociación entre receta e insumo, con cantidades necesarias. |
| Insumo | Materia prima para productos. Tiene stock y stock mínimo. |
| Cobro | Registro de pago de un pedido. Genera comprobante. |
| Empleado (abstracta) | Persona que opera el sistema (nombre, contacto, usuario, contraseña). |
| Ventas | Usuario que registra pedidos y gestiona cobros. |
| Producción | Usuario que prepara productos elaborados. |
| Administrador | Usuario con permisos para gestionar productos, recetas, insumos y usuarios. |

---

## Requerimientos funcionales

- Gestión de usuarios y roles
- Gestión de clientes
- Gestión de pedidos
- Gestión de productos
- Gestión de cobros y facturas
- Control de inventario
- Gestión de recetas y preparación de encargos
- Seguridad y roles diferenciados

---

## Requerimientos no funcionales

- Accesibilidad y facilidad de uso  
- Buen rendimiento y escalabilidad  
- Portabilidad y estabilidad  
- Mantenibilidad

---

## Tecnologías utilizadas

- **Backend:** Node.js, Express, Sequelize, PostgreSQL  
- **Frontend:** Angular/React (según implementación)  
- **Versionamiento:** Git y GitHub  

---

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/jonimende/La-Marquesa.git
