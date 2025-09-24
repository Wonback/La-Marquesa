# 🍞 La Marquesa - Sistema de Panificación

**Grupo 8:** Franco de Iriondo, Mateo Zaballo, Gastón Nuñez, Jonas Mendelovich  

---

## 📌 Descripción del proyecto

La panadería **“La Marquesa”** actualmente gestiona pedidos manualmente (WhatsApp, teléfono o en persona) y enfrenta problemas como:

- Pérdida de pedidos y errores en fechas.  
- Confusión con ingredientes y recetas.  
- Falta de control de stock y alertas de insumos.  

Este proyecto implementa un **sistema digital** que permite:

- Registro y gestión de pedidos personalizados.  
- Control automático de stock de insumos.  
- Notificación al cliente sobre el estado del pedido.  
- Gestión de usuarios, roles y cobros.  

---

## 🎯 Objetivos

- Optimizar tiempos de producción y entrega.  
- Evitar errores en pedidos y stock.  
- Mejorar la experiencia del cliente.  
- Permitir escalabilidad y mantenibilidad del sistema.  

---

## 🗂 Dominio del Sistema

- **Pedidos personalizados**: tortas decoradas, panificados sin gluten, combos para eventos.  
- **Stock de insumos**: materias primas necesarias para productos elaborados.  
- **Cobros y facturación**: registro de pagos y emisión de comprobantes.  

---

## 🧩 Diagrama de Clases (Simplificado)

```text
Cliente 1 --- * Pedido 1 --- * DetallePedido * --- 1 Producto
                        |
                        * Cobro
Producto 1 --- 1 Receta 1 --- * DetalleReceta * --- 1 Insumo
Empleado (abstracta)
 ├─ Ventas
 ├─ Producción
 └─ Administrador
