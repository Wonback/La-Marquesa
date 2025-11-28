import { Request, Response, NextFunction } from 'express';
import { Pedido } from '../Models/Pedido';
import { DetallePedido } from '../Models/DetallePedido';
import { Producto } from '../Models/Producto';
import { Cliente } from '../Models/Cliente';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Insumo } from '../Models/Insumo';

const ESTADOS_VALIDOS = ['registrado', 'confirmado', 'en producción', 'listo', 'entregado'] as const;

const pedidoInclude = [
  {
    model: DetallePedido,
    as: 'detallePedidos',
    include: [
      {
        model: Producto,
        as: 'producto',
        include: [
          {
            model: Receta,
            as: 'receta',
            include: [
              { 
                model: DetalleReceta, 
                as: 'detallesReceta',
                include: [{ model: Insumo, as: 'insumo' }]
              },
            ],
          },
        ],
      },
    ],
  },
  { 
    model: Cliente,
    as: 'cliente'
  },
];

export const pedidoController = {
  crearPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cliente_id, fecha_entrega, productos } = req.body;

      if (!productos || productos.length === 0) {
        return res.status(400).json({ message: 'Un pedido debe contener al menos un producto' });
      }

      const nuevoPedido = await Pedido.create({ cliente_id, fecha_entrega });
      
      // Variable para sumar el total del pedido si quisieras guardarlo en la tabla pedidos
      let totalPedido = 0; 

      for (const item of productos) {
        // CORRECCIÓN 1: Buscamos el producto para obtener su precio REAL actual
        const productoDB = await Producto.findByPk(item.producto_id);

        if (!productoDB) {
           // Si un producto no existe, podrías borrar el pedido o lanzar error. 
           // Aquí lanzamos error para simplificar.
           await nuevoPedido.destroy(); 
           return res.status(404).json({ message: `El producto con ID ${item.producto_id} no existe.` });
        }

        const precioUnitario = productoDB.precio;
        const subtotal = precioUnitario * item.cantidad;
        totalPedido += subtotal;

        // CORRECCIÓN 2: Guardamos precio_unitario y subtotal
        await DetallePedido.create({
          pedido_id: nuevoPedido.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario, // <--- CRUCIAL: Snapshot del precio
          subtotal: subtotal,              // <--- CRUCIAL: Campo requerido
          observaciones: item.observaciones || null,
        });
      }
      
      // Opcional: Si tu tabla 'pedidos' tiene un campo 'total', actualízalo aquí:
      // await nuevoPedido.update({ total: totalPedido });

      const pedidoConDetalle = await Pedido.findByPk(nuevoPedido.id, { include: pedidoInclude });

      res.status(201).json(pedidoConDetalle);
    } catch (err) {
      next(err);
    }
  },

  listarPedidos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedidos = await Pedido.findAll({ include: pedidoInclude });
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  },

  obtenerPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id, { include: pedidoInclude });
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (err) {
      next(err);
    }
  },

  actualizarEstado: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { estado } = req.body;
      const user = (req as any).user;
      const pedido = await Pedido.findByPk(req.params.id);

      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      // --- CORRECCIÓN AQUÍ ---
      // Si el estado que envían es el mismo que ya tiene, no hacemos nada y devolvemos OK.
      if (pedido.estado === estado) {
         return res.json({ message: 'El estado no ha cambiado', pedido });
      }
      // -----------------------

      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido' });
      }

      const transiciones: Record<string, string[]> = {
        registrado: ['confirmado'],
        confirmado: ['en producción'],
        'en producción': ['listo'],
        listo: ['entregado'],
        entregado: [],
      };

      // Validación de transición
      if (!transiciones[pedido.estado].includes(estado)) {
        return res.status(400).json({ message: `No se puede pasar de '${pedido.estado}' a '${estado}'` });
      }

      // Validaciones de roles (Tu código original sigue aquí)
      if (estado === 'confirmado' && !['Ventas', 'Admin'].includes(user.rol)) {
        return res.status(403).json({ message: 'Solo Ventas o Admin pueden confirmar pedidos' });
      }
      if (estado === 'en producción' && !['Producción', 'Admin'].includes(user.rol)) {
        return res.status(403).json({ message: 'Solo Producción o Admin pueden iniciar producción' });
      }
      if (estado === 'listo' && !['Producción', 'Admin'].includes(user.rol)) {
        return res.status(403).json({ message: 'Solo Producción o Admin pueden marcar como listo' });
      }
      if (estado === 'entregado' && !['Ventas', 'Admin'].includes(user.rol)) {
        return res.status(403).json({ message: 'Solo Ventas o Admin pueden entregar pedidos' });
      }

      pedido.estado = estado;
      await pedido.save();

      res.json({ message: `Pedido actualizado a '${estado}'`, pedido });
    } catch (err) {
      next(err);
    }
  },
  
  actualizarPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { cliente_id, fecha_entrega, productos } = req.body;

      const pedido = await Pedido.findByPk(id);
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      // Validar que solo se edite si está 'registrado' (opcional, pero recomendado)
      if (pedido.estado !== 'registrado') {
         return res.status(400).json({ message: 'Solo se pueden editar pedidos en estado registrado.' });
      }

      // 1. Actualizar Cabecera
      await pedido.update({ cliente_id, fecha_entrega });

      // 2. Actualizar Productos (si vienen en el body)
      if (productos && productos.length > 0) {
        
        // A) Borrar detalles viejos
        await DetallePedido.destroy({ where: { pedido_id: id } });

        // B) Crear nuevos con precio actualizado
        for (const item of productos) {
          const productoDB = await Producto.findByPk(item.producto_id);
          
          if (productoDB) {
            const precioUnitario = productoDB.precio;
            const subtotal = precioUnitario * item.cantidad;

            await DetallePedido.create({
              pedido_id: pedido.id,
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              precio_unitario: precioUnitario,
              subtotal: subtotal,
              observaciones: item.observaciones || null,
            });
          }
        }
      }

      // 3. Devolver actualizado
      const pedidoActualizado = await Pedido.findByPk(id, { include: pedidoInclude });
      res.json(pedidoActualizado);

    } catch (err) {
      next(err);
    }
  },

  eliminarPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id);
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      await pedido.destroy();
      res.json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },

  confirmarPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const pedido = await Pedido.findByPk(req.params.id, { include: pedidoInclude });

      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      if (pedido.estado !== 'registrado') {
        return res.status(400).json({
          message: `El pedido no puede confirmarse porque está en estado '${pedido.estado}'`,
        });
      }

      if (!['Ventas', 'Admin'].includes(user.rol)) {
        return res.status(403).json({ message: 'Solo Ventas o Admin pueden confirmar pedidos' });
      }

      if (!pedido.detallePedidos || pedido.detallePedidos.length === 0) {
        return res.status(400).json({ message: 'El pedido no tiene productos y no puede confirmarse' });
      }

      // Verificación de stock
      for (const detalle of pedido.detallePedidos) {
        const producto = detalle.producto!;
        
        // CORRECCIÓN 3: Cambiado 'detalleRecetas' por 'detallesReceta' (Plural)
        if (producto.es_elaborado && producto.receta?.detallesReceta) {
          for (const dr of producto.receta.detallesReceta) {
            const insumo = dr.insumo!;
            const cantidadUsada = dr.cantidad * detalle.cantidad;

            if (insumo.stock < cantidadUsada) {
              return res.status(400).json({
                message: `No hay stock suficiente del insumo '${insumo.nombre}'. Disponible: ${insumo.stock}, requerido: ${cantidadUsada}`,
              });
            }
          }
        }
      }

      // Actualización de stock
      for (const detalle of pedido.detallePedidos) {
        const producto = detalle.producto!;
        
        // CORRECCIÓN 4: Cambiado 'detalleRecetas' por 'detallesReceta' (Plural)
        if (producto.es_elaborado && producto.receta?.detallesReceta) {
          for (const dr of producto.receta.detallesReceta) {
            const insumo = dr.insumo!;
            const cantidadUsada = dr.cantidad * detalle.cantidad;

            insumo.stock -= cantidadUsada;
            await insumo.save();

            if (insumo.stock <= insumo.stock_minimo) {
              console.log(`⚠️ ALERTA: El insumo ${insumo.nombre} está por debajo del stock mínimo.`);
            }
          }
        }
      }

      pedido.estado = 'confirmado';
      await pedido.save();

      res.json({ message: 'Pedido confirmado y stock actualizado', pedido });
    } catch (err) {
      next(err);
    }
  }
};