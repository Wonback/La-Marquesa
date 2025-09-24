import { Request, Response, NextFunction } from 'express';
import { Pedido } from '../Models/Pedido';
import { DetallePedido } from '../Models/DetallePedido';
import { Producto } from '../Models/Producto';
import { Cliente } from '../Models/Cliente';
import { Receta } from '../Models/Receta';
import { DetalleReceta } from '../Models/DetalleReceta';
import { Insumo } from '../Models/Insumo';

export const pedidoController = {
  crearPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cliente_id, fecha_entrega, productos } = req.body;
      const nuevoPedido = await Pedido.create({ cliente_id, fecha_entrega });

      if (productos && productos.length > 0) {
        for (const item of productos) {
          await DetallePedido.create({
            pedido_id: nuevoPedido.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            observaciones: item.observaciones || null,
          });
        }
      }

      const pedidoConDetalle = await Pedido.findByPk(nuevoPedido.id, {
        include: [
          { model: DetallePedido, as: 'detallePedidos', include: [Producto] },
          { model: Cliente },
        ],
      });

      res.status(201).json(pedidoConDetalle);
    } catch (err) {
      next(err);
    }
  },

  listarPedidos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedidos = await Pedido.findAll({
        include: [
          { model: DetallePedido, as: 'detallePedidos', include: [Producto] },
          { model: Cliente },
        ],
      });
      res.json(pedidos);
    } catch (err) {
      next(err);
    }
  },

  obtenerPedido: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          { model: DetallePedido, as: 'detallePedidos', include: [Producto] },
          { model: Cliente },
        ],
      });
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (err) {
      next(err);
    }
  },

  actualizarEstado: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id);
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      const { estado } = req.body;
      pedido.estado = estado;
      await pedido.save();

      res.json(pedido);
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
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          { model: DetallePedido, as: 'detallePedidos', include: [Producto] },
          { model: Cliente },
        ],
      });

      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      for (const detalle of pedido.detallePedidos || []) {
        const producto = detalle.Producto!;
        if (producto.es_elaborado) {
          const receta = await Receta.findOne({
            where: { producto_id: producto.id },
            include: [{ model: DetalleReceta, as: 'detalleRecetas' }],
          });

          if (!receta) continue;

          for (const dr of receta.detalleRecetas || []) {
            const insumo = await Insumo.findByPk(dr.insumo_id);
            if (!insumo) continue;

            const cantidadUsada = dr.cantidad * detalle.cantidad;
            insumo.stock -= cantidadUsada;
            await insumo.save();

            if (insumo.stock <= insumo.stock_minimo) {
              console.log(`ALERTA: El insumo ${insumo.nombre} está por debajo del stock mínimo.`);
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
  },
};
