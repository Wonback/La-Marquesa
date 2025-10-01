import { Request, Response, NextFunction } from 'express';
import { Insumo } from '../Models/Insumo';

const checkStockCritico = (insumo: Insumo) => {
  if (insumo.stock <= insumo.stock_minimo) {
    console.warn(
      `⚠️ ALERTA: El insumo '${insumo.nombre}' está en nivel crítico de stock. Stock actual: ${insumo.stock}, mínimo: ${insumo.stock_minimo}`
    );
  }
};

export const insumoController = {
  crearInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, stock, stock_minimo } = req.body;

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
        console.warn(
          `⚠️ Atención: Stock mínimo (${stock_minimo}) mayor que el stock inicial (${stock}) para el insumo '${nombre}'`
        );
      }

      const nuevoInsumo = await Insumo.create({ nombre: nombre.trim(), stock, stock_minimo });

      checkStockCritico(nuevoInsumo);

      return res.status(201).json({
        message: 'Insumo creado correctamente',
        data: nuevoInsumo,
      });
    } catch (err) {
      next(err);
    }
  },

  listarInsumos: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const insumos = await Insumo.findAll();
      return res.json(insumos);
    } catch (err) {
      next(err);
    }
  },

  obtenerInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) {
        return res.status(404).json({ message: 'Insumo no encontrado' });
      }
      return res.json(insumo);
    } catch (err) {
      next(err);
    }
  },

  actualizarInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) {
        return res.status(404).json({ message: 'Insumo no encontrado' });
      }

      const { nombre, stock, stock_minimo } = req.body;

      if (stock !== undefined && stock < 0) {
        return res.status(400).json({ message: 'El stock no puede ser negativo' });
      }
      if (stock_minimo !== undefined && stock_minimo < 0) {
        return res.status(400).json({ message: 'El stock mínimo no puede ser negativo' });
      }

      await insumo.update({
        nombre: nombre?.trim() ?? insumo.nombre,
        stock: stock ?? insumo.stock,
        stock_minimo: stock_minimo ?? insumo.stock_minimo,
      });

      checkStockCritico(insumo);

      return res.json({
        message: 'Insumo actualizado correctamente',
        data: insumo,
      });
    } catch (err) {
      next(err);
    }
  },

  eliminarInsumo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const insumo = await Insumo.findByPk(req.params.id);
      if (!insumo) {
        return res.status(404).json({ message: 'Insumo no encontrado' });
      }

      await insumo.destroy();

      return res.json({
        message: `Insumo '${insumo.nombre}' eliminado correctamente`,
      });
    } catch (err) {
      next(err);
    }
  },
};
