import { Request, Response, NextFunction } from 'express';
import { Insumo } from '../Models/Insumo';

const checkStockCritico = (insumo: Insumo) => {
  if (insumo.stock <= insumo.stock_minimo) {
    console.log(`⚠️ ALERTA: El insumo '${insumo.nombre}' está en nivel crítico de stock. Stock actual: ${insumo.stock}, mínimo: ${insumo.stock_minimo}`);
  }
};

export const insumoController = {
  crearInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, stock, stock_minimo } = req.body;

      // validaciones
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ message: 'El nombre del insumo es obligatorio' });
      }
      if (stock < 0) {
        return res.status(400).json({ message: 'El stock no puede ser negativo' });
      }
      if (stock_minimo < 0) {
        return res.status(400).json({ message: 'El stock mínimo no puede ser negativo' });
      }
      if (stock_minimo > stock) {
        console.warn(`⚠️ Atención: El stock mínimo (${stock_minimo}) es mayor que el stock inicial (${stock}) para el insumo '${nombre}'`);
      }

      const nuevoInsumo = await Insumo.create({ nombre, stock, stock_minimo });

      checkStockCritico(nuevoInsumo);

      res.status(201).json(nuevoInsumo);
    } catch (err) {
      next(err);
    }
  },

  listarInsumos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumos = await Insumo.findAll();
      res.json(insumos);
    } catch (err) {
      next(err);
    }
  },

  obtenerInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });
      res.json(insumo);
    } catch (err) {
      next(err);
    }
  },

  actualizarInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });

      const { nombre, stock, stock_minimo } = req.body;

      // validaciones
      if (stock !== undefined && stock < 0) {
        return res.status(400).json({ message: 'El stock no puede ser negativo' });
      }
      if (stock_minimo !== undefined && stock_minimo < 0) {
        return res.status(400).json({ message: 'El stock mínimo no puede ser negativo' });
      }

      await insumo.update({ nombre, stock, stock_minimo });

      checkStockCritico(insumo);

      res.json({ message: 'Insumo actualizado correctamente', insumo });
    } catch (err) {
      next(err);
    }
  },

  eliminarInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });

      await insumo.destroy();
      res.json({ message: `Insumo '${insumo.nombre}' eliminado correctamente` });
    } catch (err) {
      next(err);
    }
  },
};
