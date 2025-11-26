import { Request, Response, NextFunction } from 'express';
import { Cobro } from '../Models/Cobro';
import { Pedido } from '../Models/Pedido';
import { Cliente } from '../Models/Cliente'; // <--- 1. IMPORTANTE: Importar el modelo Cliente

const METODOS_VALIDOS = ['efectivo', 'debito', 'credito', 'transferencia'] as const;

// Definimos el 'include' completo en una constante para no repetirlo
const cobroInclude = [
  {
    model: Pedido,
    as: 'pedido',
    include: [
      { 
        model: Cliente, 
        as: 'cliente' // <--- 2. IMPORTANTE: Pedir los datos del cliente anidados
      }
    ]
  }
];

export const cobroController = {
  crearCobro: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pedido_id, monto, metodo_pago } = req.body;

      const pedido = await Pedido.findByPk(pedido_id);
      if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

      if (pedido.estado !== 'listo') {
        return res.status(400).json({
          message: `Solo se puede cobrar un pedido en estado 'listo'. Estado actual: '${pedido.estado}'`,
        });
      }

      if (!METODOS_VALIDOS.includes(metodo_pago.toLowerCase())) {
        return res.status(400).json({ message: 'Método de pago inválido' });
      }

      const nuevoCobro = await Cobro.create({ pedido_id, monto, metodo_pago });

      // Al cobrar, el pedido pasa a entregado
      pedido.estado = 'entregado';
      await pedido.save();

      // Buscamos el cobro recién creado con todos los datos (incluyendo cliente)
      const cobroConPedido = await Cobro.findByPk(nuevoCobro.id, {
        include: cobroInclude
      });

      res.status(201).json({
        message: 'Cobro registrado y pedido entregado',
        cobro: cobroConPedido,
      });
    } catch (err) {
      next(err);
    }
  },

  listarCobros: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cobros = await Cobro.findAll({
        include: cobroInclude // Usamos el include completo
      });
      res.json(cobros);
    } catch (err) {
      next(err);
    }
  },

  obtenerCobro: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cobro = await Cobro.findByPk(req.params.id, {
        include: cobroInclude // Usamos el include completo
      });
      if (!cobro) return res.status(404).json({ message: 'Cobro no encontrado' });
      res.json(cobro);
    } catch (err) {
      next(err);
    }
  },

  actualizarCobro: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { monto, metodo_pago } = req.body;
      const cobro = await Cobro.findByPk(req.params.id);

      if (!cobro) return res.status(404).json({ message: 'Cobro no encontrado' });

      if (metodo_pago) {
        if (!METODOS_VALIDOS.includes(metodo_pago.toLowerCase())) {
          return res.status(400).json({ message: 'Método de pago inválido' });
        }
        cobro.metodo_pago = metodo_pago;
      }

      if (monto) cobro.monto = monto;

      await cobro.save();

      res.json({ message: 'Cobro actualizado correctamente', cobro });
    } catch (err) {
      next(err);
    }
  },

  eliminarCobro: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cobro = await Cobro.findByPk(req.params.id);
      if (!cobro) return res.status(404).json({ message: 'Cobro no encontrado' });

      await cobro.destroy();
      res.json({ message: 'Cobro eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};